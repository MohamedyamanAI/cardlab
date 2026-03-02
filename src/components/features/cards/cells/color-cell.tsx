"use client";

import { useRef } from "react";

interface ColorCellProps {
  value: unknown;
  onCommit: (value: string) => void;
}

export function ColorCell({ value, onCommit }: ColorCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const color = typeof value === "string" && value ? value : "#000000";

  return (
    <div className="flex min-h-[28px] items-center gap-2 px-1">
      <button
        type="button"
        className="size-5 shrink-0 rounded border border-border"
        style={{ backgroundColor: color }}
        onClick={() => inputRef.current?.click()}
      />
      <span className="truncate text-xs text-muted-foreground">{color}</span>
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => onCommit(e.target.value)}
        className="invisible absolute size-0"
        tabIndex={-1}
      />
    </div>
  );
}
