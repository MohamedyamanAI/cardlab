"use client";

import { useState, useRef, useEffect } from "react";

interface TextCellProps {
  value: unknown;
  isEditing: boolean;
  initialKey?: string;
  onStartEdit: () => void;
  onCommit: (value: string, moveDown?: boolean) => void;
  onCancel: () => void;
}

export function TextCell({
  value,
  isEditing,
  initialKey,
  onStartEdit,
  onCommit,
  onCancel,
}: TextCellProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      // If started by typing a key, use that key as initial value (replace mode)
      // Otherwise, use the existing value (F2 / Enter / double-click = append mode)
      setDraft(initialKey ?? String(value ?? ""));
      setTimeout(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          if (initialKey) {
            // Cursor at end after the typed character
            input.setSelectionRange(input.value.length, input.value.length);
          } else {
            // Select all for easy replacement
            input.select();
          }
        }
      }, 0);
    }
  }, [isEditing, value, initialKey]);

  if (!isEditing) {
    return (
      <div
        className="min-h-[28px] w-full cursor-text truncate px-2 py-0.5 leading-[28px]"
        onDoubleClick={onStartEdit}
      >
        {String(value ?? "") || "\u00A0"}
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
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
          // Let the grid handle Tab
          return;
        }
        e.stopPropagation();
      }}
      className="h-[28px] w-full rounded-sm bg-background px-2 py-0.5 text-sm outline-none ring-2 ring-primary"
    />
  );
}
