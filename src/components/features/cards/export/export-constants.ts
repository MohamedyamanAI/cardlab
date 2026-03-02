import type { CardExportFormat, ResolvedCard } from "@/lib/types/export";

export const DEFAULT_CARD_WIDTH = 825;
export const DEFAULT_CARD_HEIGHT = 1125;
export const PDF_GAP = 20;
export const PDF_MARGIN = 40;

export const FORMAT_LABELS: Record<CardExportFormat, string> = {
  png: "PNG Images",
  svg: "SVG Images",
  pdf: "PDF Print Sheet",
  "spritesheet-tts": "TTS Spritesheet",
  "spritesheet-roll20": "Roll20 Spritesheet",
};

export function getCardLabel(rc: ResolvedCard, index: number): string {
  const data = rc.cardData;
  for (const key of ["name", "title", "card-name", "card_name"]) {
    if (typeof data[key] === "string" && (data[key] as string).length > 0) {
      return String(data[key]);
    }
  }
  return `Card ${index + 1}`;
}

export function getCardName(rc: ResolvedCard, index: number): string {
  const data = rc.cardData;
  for (const key of ["name", "title", "card-name", "card_name"]) {
    if (typeof data[key] === "string" && (data[key] as string).length > 0) {
      return String(data[key])
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }
  }
  return String(index + 1).padStart(3, "0");
}
