"use client";

import { useState, useRef, useEffect } from "react";

interface NumberCellProps {
  value: unknown;
  isEditing: boolean;
  initialKey?: string;
  onStartEdit: () => void;
  onCommit: (value: number | null, moveDown?: boolean) => void;
  onCancel: () => void;
}

export function NumberCell({
  value,
  isEditing,
  initialKey,
  onStartEdit,
  onCommit,
  onCancel,
}: NumberCellProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setDraft(initialKey ?? String(value ?? ""));
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isEditing, value, initialKey]);

  const parseValue = () => {
    const num = draft === "" ? null : Number(draft);
    return num !== null && isNaN(num) ? null : num;
  };

  if (!isEditing) {
    return (
      <div
        className="min-h-[28px] w-full cursor-text truncate px-2 py-0.5 tabular-nums leading-[28px]"
        onDoubleClick={onStartEdit}
      >
        {value != null ? String(value) : "\u00A0"}
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(parseValue())}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit(parseValue(), true);
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
      className="h-[28px] w-full rounded-sm bg-background px-2 py-0.5 text-sm tabular-nums outline-none ring-2 ring-primary"
    />
  );
}
