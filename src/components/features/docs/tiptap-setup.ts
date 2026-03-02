import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import Image from "@tiptap/extension-image";
import type { Extensions } from "@tiptap/react";

/**
 * Centralized TipTap extension configuration for the document editor.
 * All extensions and their options are configured here.
 */
export function createEditorExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true },
      orderedList: { keepMarks: true },
    }),
    Image.configure({
      HTMLAttributes: { class: "rounded-lg max-w-full" },
      allowBase64: false,
    }),
    Placeholder.configure({
      placeholder: "Start writing...",
    }),
  ];
}
