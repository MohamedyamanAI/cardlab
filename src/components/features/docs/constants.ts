import type { DocType } from "@/lib/types";

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  theme: "Theme",
  lore: "Lore",
  rules: "Rules",
  card_types: "Card Types",
  sets: "Sets",
  distribution: "Distribution",
  art_style_guide: "Art Style Guide",
  keywords: "Keywords",
  resource_system: "Resource System",
  balance_rules: "Balance Rules",
};

export const DOC_TYPE_COLORS: Record<DocType, { bg: string; text: string }> = {
  theme: { bg: "bg-violet-500/15", text: "text-violet-700 dark:text-violet-400" },
  lore: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400" },
  rules: { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-400" },
  card_types: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400" },
  sets: { bg: "bg-pink-500/15", text: "text-pink-700 dark:text-pink-400" },
  distribution: { bg: "bg-cyan-500/15", text: "text-cyan-700 dark:text-cyan-400" },
  art_style_guide: { bg: "bg-rose-500/15", text: "text-rose-700 dark:text-rose-400" },
  keywords: { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400" },
  resource_system: { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-400" },
  balance_rules: { bg: "bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-400" },
};

export const DOC_TYPES = Object.entries(DOC_TYPE_LABELS) as [DocType, string][];
