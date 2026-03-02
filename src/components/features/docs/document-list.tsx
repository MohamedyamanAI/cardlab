"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Document, DocType } from "@/lib/types";
import { DOC_TYPE_LABELS, DOC_TYPE_COLORS } from "./constants";

type DocumentListProps = {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
};

export function DocumentList({
  documents,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}: DocumentListProps) {
  const [search, setSearch] = useState("");

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search docs..."
            className="h-8 w-full rounded-lg border border-input bg-input/30 pl-7 pr-2 text-xs outline-none transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50"
          />
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onCreate}>
          <HugeiconsIcon icon={Add01Icon} size={16} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {filtered.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              {search ? "No matching documents" : "No documents yet"}
            </p>
          )}
          {filtered.map((doc) => {
            const typeColor = doc.type
              ? DOC_TYPE_COLORS[doc.type as DocType]
              : null;

            return (
              <div
                key={doc.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(doc.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(doc.id);
                }}
                className={`group flex w-full cursor-pointer items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  selectedId === doc.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {doc.type && typeColor && (
                      <span
                        className={`inline-flex h-4 items-center rounded-full px-1.5 text-[10px] font-medium ${typeColor.bg} ${typeColor.text}`}
                      >
                        {DOC_TYPE_LABELS[doc.type as DocType]}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(doc.updated_at ?? doc.created_at ?? "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc.id);
                  }}
                  className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
