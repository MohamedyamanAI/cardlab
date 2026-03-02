import type { Json } from "@/lib/supabase/database.types";
import type { Layout } from "@/lib/types";
import type { LayoutCondition } from "@/lib/types/conditions";

/** Type guard: checks if a Json value is a valid LayoutCondition */
export function isLayoutCondition(
  json: Json | null
): json is LayoutCondition & Json {
  if (!json || typeof json !== "object" || Array.isArray(json)) return false;
  const obj = json as Record<string, unknown>;
  return typeof obj.field === "string" && typeof obj.operator === "string";
}

/** Evaluate a single condition against a card's data */
export function evaluateCondition(
  condition: LayoutCondition,
  cardData: Record<string, Json>
): boolean {
  const raw = cardData[condition.field];

  if (condition.operator === "is_empty") {
    return raw === null || raw === undefined || raw === "";
  }
  if (condition.operator === "is_not_empty") {
    return raw !== null && raw !== undefined && raw !== "";
  }

  const cardValue = raw ?? null;
  const condValue = condition.value ?? null;

  // eq / neq work for any type via loose string comparison
  if (condition.operator === "eq") {
    return String(cardValue) === String(condValue);
  }
  if (condition.operator === "neq") {
    return String(cardValue) !== String(condValue);
  }

  // Numeric comparisons
  const numCard = Number(cardValue);
  const numCond = Number(condValue);
  if (isNaN(numCard) || isNaN(numCond)) return false;

  switch (condition.operator) {
    case "gt":
      return numCard > numCond;
    case "gte":
      return numCard >= numCond;
    case "lt":
      return numCard < numCond;
    case "lte":
      return numCard <= numCond;
    default:
      return false;
  }
}

/** Return the first layout whose condition matches the card, or the first fallback (no condition) */
export function resolveLayoutForCard(
  layouts: Layout[],
  cardData: Record<string, Json>
): Layout | null {
  let fallback: Layout | null = null;

  for (const layout of layouts) {
    if (!isLayoutCondition(layout.condition)) {
      if (!fallback) fallback = layout;
      continue;
    }
    if (evaluateCondition(layout.condition, cardData)) {
      return layout;
    }
  }

  return fallback;
}

/** Return indices of cards that match a condition (all indices if condition is null) */
export function filterCardsByCondition(
  cards: { data: Json }[],
  condition: Json | null
): number[] {
  if (!isLayoutCondition(condition)) {
    return cards.map((_, i) => i);
  }

  const result: number[] = [];
  for (let i = 0; i < cards.length; i++) {
    const data =
      typeof cards[i].data === "object" && cards[i].data !== null
        ? (cards[i].data as Record<string, Json>)
        : {};
    if (evaluateCondition(condition, data)) {
      result.push(i);
    }
  }
  return result;
}
