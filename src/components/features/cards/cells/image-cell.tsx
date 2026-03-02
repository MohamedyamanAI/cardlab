"use client";

import { useState, useRef, useEffect } from "react";
import { IconPhoto } from "@tabler/icons-react";

interface ImageCellProps {
  value: unknown;
  isEditing: boolean;
  initialKey?: string;
  onStartEdit: () => void;
  onCommit: (value: string, moveDown?: boolean) => void;
  onCancel: () => void;
}

export function ImageCell({
  value,
  isEditing,
  initialKey,
  onStartEdit,
  onCommit,
  onCancel,
}: ImageCellProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const url = typeof value === "string" ? value : "";

  useEffect(() => {
    if (isEditing) {
      setDraft(initialKey ?? String(value ?? ""));
      setTimeout(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          if (initialKey) {
            input.setSelectionRange(input.value.length, input.value.length);
          } else {
            input.select();
          }
        }
      }, 0);
    }
  }, [isEditing, value, initialKey]);

  if (!isEditing) {
    return (
      <div
        className="flex min-h-[28px] w-full cursor-text items-center gap-1.5 px-2 py-0.5"
        onDoubleClick={onStartEdit}
      >
        {url ? (
          <>
            <img
              src={url}
              alt=""
              className="size-5 shrink-0 rounded object-cover"
            />
            <span className="truncate text-xs text-muted-foreground">
              {url}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconPhoto size={14} />
            Add image URL
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="url"
      value={draft}
      placeholder="https://..."
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit(draft, true);
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
        if (e.key === "Tab") {
          return;
        }
        e.stopPropagation();
      }}
      className="h-[28px] w-full rounded-sm bg-background px-2 py-0.5 text-sm outline-none ring-2 ring-primary"
    />
  );
}
