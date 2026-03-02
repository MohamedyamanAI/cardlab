import type { ShapeElement } from "@/lib/types/canvas-elements";

interface ShapeRendererProps {
  element: ShapeElement;
}

export function ShapeRenderer({ element }: ShapeRendererProps) {
  return (
    <div
      className="pointer-events-none h-full w-full select-none"
      style={{
        backgroundColor: element.fill ?? "transparent",
        border:
          element.stroke
            ? `${element.stroke_width ?? 1}px solid ${element.stroke}`
            : "none",
        borderRadius: element.border_radius ?? 0,
        opacity: element.opacity ?? 1,
      }}
    />
  );
}
