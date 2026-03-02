export interface BaseElement {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  bind_to?: string; // property slug
}

export interface TextElement extends BaseElement {
  type: "text";
  static_text?: string;
  font_size: number;
  font_weight: "normal" | "bold";
  text_align: "left" | "center" | "right";
  vertical_align: "top" | "middle" | "bottom";
  color: string;
  overflow: "wrap" | "truncate" | "visible";
}

export interface ImageElement extends BaseElement {
  type: "image";
  static_src?: string;
  object_fit: "cover" | "contain" | "fill";
  border_radius?: number;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  fill?: string;
  stroke?: string;
  stroke_width?: number;
  border_radius?: number;
  opacity?: number;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement;
