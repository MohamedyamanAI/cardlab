"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectCellProps {
  value: unknown;
  options: string[];
  onCommit: (value: string) => void;
}

export function SelectCell({ value, options, onCommit }: SelectCellProps) {
  const current = String(value ?? "");

  return (
    <div className="min-h-[28px] w-full">
      <Select value={current} onValueChange={onCommit}>
        <SelectTrigger className="h-[28px] w-full border-0 bg-transparent px-1 shadow-none focus:ring-1 focus:ring-primary">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
