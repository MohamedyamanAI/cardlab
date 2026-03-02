"use client";

import { useState, useEffect } from "react";
import type { TextElement } from "@/lib/types/canvas-elements";
import { generateHTML } from "@tiptap/react";
import { richTextExtensions } from "../rich-text-editor-setup";

interface TextRendererProps {
  element: TextElement;
  previewValue?: string | null;
}

export function TextRenderer({ element, previewValue }: TextRendererProps) {
  const [richHtml, setRichHtml] = useState<string | null>(null);

  // Render rich_text via generateHTML in useEffect (client-only, per TipTap gotcha)
  useEffect(() => {
    if (element.rich_text) {
      try {
        const html = generateHTML(element.rich_text as Parameters<typeof generateHTML>[0], richTextExtensions);
        setRichHtml(html);
      } catch {
        setRichHtml(null);
      }
    } else {
      setRichHtml(null);
    }
  }, [element.rich_text]);

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

  const textShadowCSS = element.text_shadow
    ? `${element.text_shadow.offset_x}px ${element.text_shadow.offset_y}px ${element.text_shadow.blur}px ${element.text_shadow.color}`
    : undefined;

  const baseStyle: React.CSSProperties = {
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
    overflow: element.overflow === "visible" ? "visible" : "hidden",
    textOverflow: element.overflow === "truncate" ? "ellipsis" : undefined,
    whiteSpace: element.overflow === "truncate" ? "nowrap" : "normal",
    wordBreak: element.overflow === "wrap" ? "break-word" : undefined,
    lineHeight: element.line_height ?? 1.2,
    fontFamily: element.font_family || undefined,
    letterSpacing: element.letter_spacing != null ? `${element.letter_spacing}px` : undefined,
    textShadow: textShadowCSS,
  };

  // If rich_text is present and no preview override, render rich HTML
  if (richHtml && previewValue == null) {
    return (
      <div
        className="pointer-events-none flex h-full w-full select-none"
        style={baseStyle}
      >
        <div
          className="w-full rich-text-output"
          dangerouslySetInnerHTML={{ __html: richHtml }}
        />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none flex h-full w-full select-none"
      style={baseStyle}
    >
      <span className="w-full">{displayText}</span>
    </div>
  );
}
