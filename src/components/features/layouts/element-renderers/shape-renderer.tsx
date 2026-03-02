import type { ShapeElement, Gradient } from "@/lib/types/canvas-elements";

interface ShapeRendererProps {
  element: ShapeElement;
}

function gradientCSS(gradient: Gradient): string {
  const stops = gradient.stops
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");
  if (gradient.type === "radial") {
    return `radial-gradient(circle, ${stops})`;
  }
  return `linear-gradient(${gradient.angle ?? 0}deg, ${stops})`;
}

export function ShapeRenderer({ element }: ShapeRendererProps) {
  const shapeType = element.shape_type ?? "rectangle";

  const background =
    element.fill_type && element.fill_type !== "solid" && element.gradient
      ? gradientCSS(element.gradient)
      : element.fill ?? "transparent";

  const isGradient =
    element.fill_type && element.fill_type !== "solid" && element.gradient;

  if (shapeType === "line") {
    return (
      <div
        className="pointer-events-none flex h-full w-full select-none items-center"
      >
        <div
          className="w-full"
          style={{
            borderTop: `${element.stroke_width ?? 1}px solid ${element.stroke ?? "#ffffff"}`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none h-full w-full select-none"
      style={{
        backgroundColor: isGradient ? undefined : (element.fill ?? "transparent"),
        backgroundImage: isGradient ? background : undefined,
        border:
          element.stroke
            ? `${element.stroke_width ?? 1}px solid ${element.stroke}`
            : "none",
        borderRadius:
          shapeType === "ellipse" ? "50%" : (element.border_radius ?? 0),
      }}
    />
  );
}
