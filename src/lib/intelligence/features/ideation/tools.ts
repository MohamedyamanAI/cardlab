import { tool } from "ai";
import { z } from "zod";
import { marked, type Token, type Tokens } from "marked";
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
            "The document content as Markdown. Use standard Markdown: ## headings, **bold**, *italic*, - bullet lists, 1. numbered lists, > blockquotes, etc."
          ),
      }),
      execute: async ({ title, type, content }) => {
        try {
          const tiptapContent = markdownToTiptap(content) as Json;
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
            type: type ?? null,
            content: tiptapContent,
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

// ---------------------------------------------------------------------------
// Markdown → TipTap JSON converter
// Uses marked's lexer to tokenize, then maps tokens directly to TipTap nodes.
// No HTML intermediary, no DOM dependency — fully server-safe.
// ---------------------------------------------------------------------------

type TipTapNode = Record<string, unknown>;
type Mark = { type: string; attrs?: Record<string, unknown> };

function markdownToTiptap(markdown: string): TipTapNode {
  const tokens = marked.lexer(markdown);
  const content = convertBlockTokens(tokens);
  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

function convertBlockTokens(tokens: Token[]): TipTapNode[] {
  const result: TipTapNode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const t = token as Tokens.Heading;
        const content = convertInlineTokens(t.tokens ?? []);
        result.push({
          type: "heading",
          attrs: { level: t.depth },
          ...(content.length > 0 && { content }),
        });
        break;
      }
      case "paragraph": {
        const t = token as Tokens.Paragraph;
        const content = convertInlineTokens(t.tokens ?? []);
        result.push({
          type: "paragraph",
          ...(content.length > 0 && { content }),
        });
        break;
      }
      case "list": {
        const t = token as Tokens.List;
        const items = t.items.map((item) => ({
          type: "listItem",
          content: convertBlockTokens(item.tokens ?? []),
        }));
        result.push({
          type: t.ordered ? "orderedList" : "bulletList",
          content: items,
        });
        break;
      }
      case "blockquote": {
        const t = token as Tokens.Blockquote;
        result.push({
          type: "blockquote",
          content: convertBlockTokens(t.tokens ?? []),
        });
        break;
      }
      case "code": {
        const t = token as Tokens.Code;
        result.push({
          type: "codeBlock",
          ...(t.lang && { attrs: { language: t.lang } }),
          content: [{ type: "text", text: t.text }],
        });
        break;
      }
      case "hr":
        result.push({ type: "horizontalRule" });
        break;
      case "text": {
        const t = token as Tokens.Text;
        if (t.tokens && t.tokens.length > 0) {
          const content = convertInlineTokens(t.tokens);
          result.push({
            type: "paragraph",
            ...(content.length > 0 && { content }),
          });
        } else if (t.text) {
          result.push({
            type: "paragraph",
            content: [{ type: "text", text: t.text }],
          });
        }
        break;
      }
      case "space":
        break;
      default:
        if ("text" in token && typeof token.text === "string") {
          result.push({
            type: "paragraph",
            content: [{ type: "text", text: token.text }],
          });
        }
        break;
    }
  }

  return result;
}

function convertInlineTokens(
  tokens: Token[],
  marks: Mark[] = []
): TipTapNode[] {
  const result: TipTapNode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "text": {
        const t = token as Tokens.Text;
        if (t.tokens && t.tokens.length > 0) {
          result.push(...convertInlineTokens(t.tokens, marks));
        } else if (t.text) {
          const node: TipTapNode = { type: "text", text: t.text };
          if (marks.length > 0) node.marks = [...marks];
          result.push(node);
        }
        break;
      }
      case "strong": {
        const t = token as Tokens.Strong;
        result.push(
          ...convertInlineTokens(t.tokens ?? [], [
            ...marks,
            { type: "bold" },
          ])
        );
        break;
      }
      case "em": {
        const t = token as Tokens.Em;
        result.push(
          ...convertInlineTokens(t.tokens ?? [], [
            ...marks,
            { type: "italic" },
          ])
        );
        break;
      }
      case "del": {
        const t = token as Tokens.Del;
        result.push(
          ...convertInlineTokens(t.tokens ?? [], [
            ...marks,
            { type: "strike" },
          ])
        );
        break;
      }
      case "codespan": {
        const t = token as Tokens.Codespan;
        result.push({
          type: "text",
          text: t.text,
          marks: [...marks, { type: "code" }],
        });
        break;
      }
      case "link": {
        const t = token as Tokens.Link;
        result.push(
          ...convertInlineTokens(t.tokens ?? [], [
            ...marks,
            { type: "link", attrs: { href: t.href, target: "_blank" } },
          ])
        );
        break;
      }
      case "br":
        result.push({ type: "hardBreak" });
        break;
      case "escape": {
        const t = token as Tokens.Escape;
        const node: TipTapNode = { type: "text", text: t.text };
        if (marks.length > 0) node.marks = [...marks];
        result.push(node);
        break;
      }
      default:
        if ("text" in token && typeof token.text === "string") {
          const node: TipTapNode = { type: "text", text: token.text };
          if (marks.length > 0) node.marks = [...marks];
          result.push(node);
        }
        break;
    }
  }

  return result;
}
