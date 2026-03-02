import { tool } from "ai";
import { z } from "zod";
import * as docRepo from "@/lib/repository/documents";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";

const docTypeEnum = z.enum([
  "theme",
  "lore",
  "rules",
  "card_types",
  "sets",
  "distribution",
  "art_style_guide",
  "keywords",
  "resource_system",
  "balance_rules",
]);

/**
 * Creates ideation-specific tools that require auth context.
 * Called per-request so the tools have access to the authenticated user.
 */
export function createIdeationTools(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return {
    create_document: tool({
      description:
        "Create a new design document for the card game project. Use this when the user wants to formalize ideas, write lore, define rules, or create any game design document.",
      inputSchema: z.object({
        title: z.string().describe("The document title"),
        type: docTypeEnum
          .optional()
          .describe("Optional document category"),
        content: z
          .string()
          .describe(
            "The document content as HTML. Use proper HTML tags like <h2>, <p>, <ul>, <li>, <strong>, <em>, <blockquote> for formatting."
          ),
      }),
      execute: async ({ title, type, content }) => {
        try {
          const tiptapContent = htmlToTiptapJson(content) as Json;
          const doc = await docRepo.createDocument(supabase, {
            userId,
            title,
            type: type ?? null,
            content: tiptapContent,
          });

          return {
            success: true,
            documentId: doc.id,
            title,
            message: `Document "${title}" created successfully. The user can find it in their Docs page.`,
          };
        } catch {
          return {
            success: false,
            message: "Failed to create document.",
          };
        }
      },
    }),
  };
}

/**
 * Convert simple HTML to a basic TipTap JSON structure.
 * Handles common block elements: paragraphs, headings, lists, blockquotes.
 */
function htmlToTiptapJson(html: string): Record<string, unknown> {
  const content: Record<string, unknown>[] = [];

  // Split by block-level tags and process
  const blocks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/(?=<(?:h[1-6]|p|ul|ol|blockquote|hr)[>\s])|(?<=<\/(?:h[1-6]|p|ul|ol|blockquote)>)/gi)
    .filter((s) => s.trim());

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Headings
    const headingMatch = trimmed.match(/^<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/i);
    if (headingMatch) {
      content.push({
        type: "heading",
        attrs: { level: parseInt(headingMatch[1]) },
        content: parseInline(headingMatch[2]),
      });
      continue;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (ulMatch) {
      content.push(parseList(ulMatch[1], "bulletList"));
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (olMatch) {
      content.push(parseList(olMatch[1], "orderedList"));
      continue;
    }

    // Blockquote
    const bqMatch = trimmed.match(/^<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (bqMatch) {
      content.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: parseInline(bqMatch[1]),
          },
        ],
      });
      continue;
    }

    // HR
    if (/^<hr/i.test(trimmed)) {
      content.push({ type: "horizontalRule" });
      continue;
    }

    // Paragraph (strip tags if wrapped)
    const pMatch = trimmed.match(/^<p[^>]*>([\s\S]*?)<\/p>/i);
    const innerText = pMatch ? pMatch[1] : trimmed;
    const inline = parseInline(innerText);
    if (inline.length > 0) {
      content.push({ type: "paragraph", content: inline });
    }
  }

  if (content.length === 0) {
    // Fallback: treat entire HTML as a single paragraph
    const inline = parseInline(html);
    if (inline.length > 0) {
      content.push({ type: "paragraph", content: inline });
    } else {
      content.push({ type: "paragraph" });
    }
  }

  return { type: "doc", content };
}

function parseInline(html: string): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  // Strip tags and extract text with marks
  const stripped = html.replace(/<[^>]+>/g, (tag) => {
    if (/<strong|<b\b/i.test(tag)) return "{{BOLD_START}}";
    if (/<\/strong|<\/b>/i.test(tag)) return "{{BOLD_END}}";
    if (/<em|<i\b/i.test(tag)) return "{{ITALIC_START}}";
    if (/<\/em|<\/i>/i.test(tag)) return "{{ITALIC_END}}";
    return "";
  });

  // Simple approach: split by mark boundaries and create text nodes
  const boldStack: boolean[] = [];
  const italicStack: boolean[] = [];

  const parts = stripped.split(/({{(?:BOLD|ITALIC)_(?:START|END)}})/);
  let bold = false;
  let italic = false;

  for (const part of parts) {
    if (part === "{{BOLD_START}}") { bold = true; boldStack.push(true); continue; }
    if (part === "{{BOLD_END}}") { bold = boldStack.length > 1; boldStack.pop(); continue; }
    if (part === "{{ITALIC_START}}") { italic = true; italicStack.push(true); continue; }
    if (part === "{{ITALIC_END}}") { italic = italicStack.length > 1; italicStack.pop(); continue; }

    const text = part.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (!text) continue;

    const marks: Record<string, unknown>[] = [];
    if (bold) marks.push({ type: "bold" });
    if (italic) marks.push({ type: "italic" });

    const node: Record<string, unknown> = { type: "text", text };
    if (marks.length > 0) node.marks = marks;
    results.push(node);
  }

  return results;
}

function parseList(
  html: string,
  listType: "bulletList" | "orderedList"
): Record<string, unknown> {
  const items: Record<string, unknown>[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = liRegex.exec(html)) !== null) {
    items.push({
      type: "listItem",
      content: [
        {
          type: "paragraph",
          content: parseInline(match[1]),
        },
      ],
    });
  }
  return { type: listType, content: items };
}
