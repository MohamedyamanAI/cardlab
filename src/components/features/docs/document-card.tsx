"use client";

import { useState, useEffect } from "react";
import { generateHTML } from "@tiptap/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import type { Document, DocType } from "@/lib/types";
import { DOC_TYPE_LABELS, DOC_TYPE_COLORS } from "./constants";
import { createEditorExtensions } from "./tiptap-setup";

type DocumentCardProps = {
  document: Document;
  onClick: () => void;
  onDelete: () => void;
};

const extensions = createEditorExtensions();

export function DocumentCard({ document, onClick, onDelete }: DocumentCardProps) {
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    try {
      const content = document.content as Record<string, unknown>;
      if (!content || !content.type) return;
      setPreviewHtml(generateHTML(content as Parameters<typeof generateHTML>[0], extensions));
    } catch {
      // ignore
    }
  }, [document.content]);

  const typeColor = document.type
    ? DOC_TYPE_COLORS[document.type as DocType]
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card transition-colors hover:border-primary/40"
    >
      {/* Content preview — scaled-down "page" */}
      <div className="relative h-64 overflow-hidden border-b border-foreground/5 bg-background">
        <div
          className="prose prose-sm dark:prose-invert pointer-events-none origin-top-left scale-[0.4] p-6"
          style={{ width: "250%" }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
        {/* Fade-out at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Card footer */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="truncate text-sm font-medium">{document.title}</p>
        <div className="flex items-center gap-1.5">
          {document.type && typeColor && (
            <span
              className={`inline-flex h-4 items-center rounded-full px-1.5 text-[10px] font-medium ${typeColor.bg} ${typeColor.text}`}
            >
              {DOC_TYPE_LABELS[document.type as DocType]}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {new Date(document.updated_at ?? document.created_at ?? "").toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-2 top-2 rounded-md bg-background/80 p-1 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <HugeiconsIcon icon={Delete02Icon} size={14} />
      </button>
    </div>
  );
}
