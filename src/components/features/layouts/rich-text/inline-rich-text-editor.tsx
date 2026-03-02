"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { richTextExtensions } from "./rich-text-editor-setup";
import type { TextElement } from "@/lib/types/canvas-elements";
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconX,
} from "@tabler/icons-react";

interface InlineRichTextEditorProps {
  element: TextElement;
}

export function InlineRichTextEditor({ element }: InlineRichTextEditorProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);
  const setEditingElement = useLayoutEditorStore((s) => s.setEditingElement);

  const initialContent = element.rich_text
    ? (element.rich_text as Parameters<typeof useEditor>[0] extends { content?: infer C } ? C : never)
    : element.static_text || "Text";

  const editor = useEditor({
    extensions: richTextExtensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class: "outline-none h-full w-full",
        style: [
          `font-size: ${element.font_size}px`,
          `font-weight: ${element.font_weight}`,
          `text-align: ${element.text_align}`,
          `color: ${element.color}`,
          `line-height: ${element.line_height ?? 1.2}`,
          element.font_family ? `font-family: ${element.font_family}` : "",
          element.letter_spacing != null ? `letter-spacing: ${element.letter_spacing}px` : "",
        ]
          .filter(Boolean)
          .join("; "),
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      updateElement(element.id, { rich_text: json });
    },
  });

  const handleClose = useCallback(() => {
    if (editor) {
      const json = editor.getJSON();
      updateElement(element.id, { rich_text: json });
    }
    setEditingElement(null);
  }, [editor, element.id, updateElement, setEditingElement]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [handleClose]);

  if (!editor) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mini toolbar above element */}
      <div
        className="absolute flex items-center gap-0.5 rounded border bg-background px-1 py-0.5 shadow-md"
        style={{ top: -32, left: 0 }}
      >
        <Button
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="sm"
          className="h-6 w-6 p-0"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
        >
          <IconBold className="size-3" />
        </Button>
        <Button
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="sm"
          className="h-6 w-6 p-0"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
        >
          <IconItalic className="size-3" />
        </Button>
        <Button
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          size="sm"
          className="h-6 w-6 p-0"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleStrike().run();
          }}
        >
          <IconStrikethrough className="size-3" />
        </Button>
        <div className="mx-0.5 h-4 w-px bg-border" />
        <input
          type="color"
          value={editor.getAttributes("textStyle").color ?? element.color}
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
          title="Text color"
        />
        <div className="mx-0.5 h-4 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onMouseDown={(e) => {
            e.preventDefault();
            handleClose();
          }}
          title="Done"
        >
          <IconX className="size-3" />
        </Button>
      </div>

      <EditorContent editor={editor} className="h-full w-full cursor-text" />
    </div>
  );
}
