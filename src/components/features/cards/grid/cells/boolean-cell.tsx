"use client";

import { Switch } from "@/components/ui/switch";

interface BooleanCellProps {
  value: unknown;
  onCommit: (value: boolean) => void;
}

export function BooleanCell({ value, onCommit }: BooleanCellProps) {
  const checked = value === true;

  return (
    <div className="flex min-h-[28px] items-center px-1">
      <Switch
        checked={checked}
        onCheckedChange={(val) => onCommit(val)}
      />
    </div>
  );
}
