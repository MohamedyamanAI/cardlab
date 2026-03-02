import Papa from "papaparse";
import type { Card, Property } from "@/lib/types";
import type { Json } from "@/lib/supabase/database.types";

function cardsToRows(
  cards: Card[],
  properties: Property[]
): Record<string, unknown>[] {
  const sorted = [...properties].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return cards.map((card) => {
    const data =
      typeof card.data === "object" && card.data !== null
        ? (card.data as Record<string, Json>)
        : {};

    const row: Record<string, unknown> = {};
    for (const prop of sorted) {
      row[prop.name] = data[prop.slug] ?? "";
    }
    return row;
  });
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCSV(
  cards: Card[],
  properties: Property[],
  projectName: string
): void {
  const rows = cardsToRows(cards, properties);
  const csv = Papa.unparse(rows);
  downloadFile(csv, `${projectName}-cards.csv`, "text/csv;charset=utf-8;");
}

export function exportJSON(
  cards: Card[],
  properties: Property[],
  projectName: string
): void {
  const rows = cardsToRows(cards, properties);
  const json = JSON.stringify(rows, null, 2);
  downloadFile(json, `${projectName}-cards.json`, "application/json");
}
