export const CARD_SIZE_PRESETS = [
  { label: "Poker (2.5 × 3.5 in)", width: 750, height: 1050 },
  { label: "Bridge (2.25 × 3.5 in)", width: 675, height: 1050 },
  { label: "Tarot (2.75 × 4.75 in)", width: 825, height: 1425 },
  { label: "Mini (1.75 × 2.5 in)", width: 525, height: 750 },
  { label: "Square (3 × 3 in)", width: 900, height: 900 },
  { label: "Large (3.5 × 5 in)", width: 1050, height: 1500 },
  { label: "Custom", width: 0, height: 0 },
] as const;

/** Find the preset index matching given dimensions, or "Custom" index */
export function findPresetIndex(width: number, height: number): number {
  const idx = CARD_SIZE_PRESETS.findIndex(
    (p) => p.width === width && p.height === height
  );
  return idx >= 0 ? idx : CARD_SIZE_PRESETS.length - 1; // Custom
}
