export interface BoxShadow {
  color: string;
  offset_x: number;
  offset_y: number;
  blur: number;
  spread: number;
}

export interface TextShadow {
  color: string;
  offset_x: number;
  offset_y: number;
  blur: number;
}

export interface GradientStop {
  color: string;
  position: number; // 0–100
}

export interface Gradient {
  type: "linear" | "radial";
  angle?: number; // degrees, for linear
  stops: GradientStop[];
}

export interface BaseElement {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  bind_to?: string; // property slug
  opacity?: number; // default 1
  blend_mode?: string; // default "normal"
  rotation?: number; // default 0 (degrees)
  locked?: boolean; // default false
  hidden?: boolean; // default false
  box_shadow?: BoxShadow;
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
  font_family?: string;
  line_height?: number;
  letter_spacing?: number;
  text_shadow?: TextShadow;
  rich_text?: object; // TipTap JSON
}

export interface ImageElement extends BaseElement {
  type: "image";
  static_src?: string;
  object_fit: "cover" | "contain" | "fill";
  border_radius?: number;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shape_type?: "rectangle" | "ellipse" | "line";
  fill?: string;
  fill_type?: "solid" | "linear" | "radial";
  gradient?: Gradient;
  stroke?: string;
  stroke_width?: number;
  border_radius?: number;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement;
