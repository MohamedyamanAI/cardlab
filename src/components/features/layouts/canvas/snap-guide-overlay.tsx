import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface SnapGuideOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
}

export function SnapGuideOverlay({ canvasWidth, canvasHeight }: SnapGuideOverlayProps) {
  const guides = useLayoutEditorStore((s) => s.activeSnapGuides);

  if (guides.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={canvasWidth}
      height={canvasHeight}
      style={{ overflow: "visible" }}
    >
      {guides.map((guide, i) =>
        guide.axis === "x" ? (
          <line
            key={`x-${i}`}
            x1={guide.position}
            y1={-9999}
            x2={guide.position}
            y2={9999}
            stroke="#ff00ff"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        ) : (
          <line
            key={`y-${i}`}
            x1={-9999}
            y1={guide.position}
            x2={9999}
            y2={guide.position}
            stroke="#ff00ff"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        )
      )}
    </svg>
  );
}
