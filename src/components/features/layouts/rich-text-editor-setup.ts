import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";

// Minimal extensions for card text: no headings, lists, or code blocks
export const richTextExtensions = [
  StarterKit.configure({
    heading: false,
    bulletList: false,
    orderedList: false,
    codeBlock: false,
    code: false,
    blockquote: false,
    horizontalRule: false,
  }),
  TextStyle,
  Color,
  TextAlign.configure({
    types: ["paragraph"],
  }),
];
