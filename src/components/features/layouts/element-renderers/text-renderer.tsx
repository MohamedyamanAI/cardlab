import type { TextElement } from "@/lib/types/canvas-elements";

interface TextRendererProps {
  element: TextElement;
  previewValue?: string | null;
}

export function TextRenderer({ element, previewValue }: TextRendererProps) {
  const displayText =
    previewValue != null
      ? String(previewValue)
      : element.static_text || (element.bind_to ? `{${element.bind_to}}` : "Text");

  const alignItems =
    element.vertical_align === "middle"
      ? "center"
      : element.vertical_align === "bottom"
        ? "flex-end"
        : "flex-start";

  return (
    <div
      className="pointer-events-none flex h-full w-full select-none"
      style={{
        fontSize: element.font_size,
        fontWeight: element.font_weight,
        textAlign: element.text_align,
        color: element.color,
        alignItems,
        justifyContent:
          element.text_align === "center"
            ? "center"
            : element.text_align === "right"
              ? "flex-end"
              : "flex-start",
        overflow:
          element.overflow === "visible" ? "visible" : "hidden",
        textOverflow:
          element.overflow === "truncate" ? "ellipsis" : undefined,
        whiteSpace:
          element.overflow === "truncate" ? "nowrap" : "normal",
        wordBreak: element.overflow === "wrap" ? "break-word" : undefined,
        lineHeight: 1.2,
      }}
    >
      <span className="w-full">{displayText}</span>
    </div>
  );
}
