import type {
  TextElement,
  ImageElement,
  ShapeElement,
} from "@/lib/types/canvas-elements";

export function createTextElement(
  overrides?: Partial<TextElement>
): TextElement {
  return {
    id: crypto.randomUUID(),
    type: "text",
    x: 100,
    y: 100,
    width: 200,
    height: 40,
    z_index: 0,
    font_size: 24,
    font_weight: "normal",
    text_align: "center",
    vertical_align: "top",
    color: "#ffffff",
    overflow: "wrap",
    ...overrides,
  };
}

export function createImageElement(
  overrides?: Partial<ImageElement>
): ImageElement {
  return {
    id: crypto.randomUUID(),
    type: "image",
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    z_index: 0,
    object_fit: "cover",
    ...overrides,
  };
}

export function createShapeElement(
  overrides?: Partial<ShapeElement>
): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: "shape",
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    z_index: 0,
    fill: "rgba(255, 255, 255, 0.2)",
    stroke: "#ffffff",
    stroke_width: 1,
    border_radius: 0,
    opacity: 1,
    ...overrides,
  };
}
