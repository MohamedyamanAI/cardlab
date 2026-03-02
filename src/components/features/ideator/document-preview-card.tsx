"use client";

import { useState, useEffect } from "react";
import { generateHTML } from "@tiptap/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { DOC_TYPE_LABELS, DOC_TYPE_COLORS } from "../docs/constants";
import { createEditorExtensions } from "../docs/tiptap-setup";
import type { DocType } from "@/lib/types";

type DocumentPreviewCardProps = {
  documentId: string;
  title: string;
  type: string | null;
  content: Record<string, unknown>;
};

const extensions = createEditorExtensions();

export function DocumentPreviewCard({
  documentId,
  title,
  type,
  content,
}: DocumentPreviewCardProps) {
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    try {
      if (!content || !content.type) return;
      setPreviewHtml(
        generateHTML(
          content as Parameters<typeof generateHTML>[0],
          extensions
        )
      );
    } catch {
      // ignore
    }
  }, [content]);

  const typeColor = type ? DOC_TYPE_COLORS[type as DocType] : null;

  return (
    <Link
      href={`/docs?open=${documentId}`}
      className="my-1 block overflow-hidden rounded-xl border border-foreground/10 bg-card transition-colors hover:border-primary/40"
    >
      {/* Content preview */}
      <div className="relative h-48 overflow-hidden border-b border-foreground/5 bg-background">
        <div
          className="prose prose-sm dark:prose-invert pointer-events-none origin-top-left scale-[0.35] p-5"
          style={{ width: "286%" }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {title}
          </p>
          {type && typeColor && (
            <span
              className={`mt-0.5 inline-flex h-4 items-center rounded-full px-1.5 text-[10px] font-medium ${typeColor.bg} ${typeColor.text}`}
            >
              {DOC_TYPE_LABELS[type as DocType]}
            </span>
          )}
        </div>
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          size={14}
          className="shrink-0 text-muted-foreground"
        />
      </div>
    </Link>
  );
}
