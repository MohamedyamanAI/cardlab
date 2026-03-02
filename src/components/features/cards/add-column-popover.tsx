"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCardsStore } from "@/lib/store/cards-store";
import type { PropertyType } from "@/lib/types";
import { IconPlus, IconX } from "@tabler/icons-react";

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "image", label: "Image" },
  { value: "select", label: "Select" },
  { value: "boolean", label: "Boolean" },
  { value: "color", label: "Color" },
];

export function AddColumnPopover({ children }: { children?: React.ReactNode }) {
  const { addProperty } = useCardsStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<PropertyType>("text");
  const [options, setOptions] = useState<string[]>([""]);
  const [required, setRequired] = useState(false);

  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (index: number) =>
    setOptions((prev) => prev.filter((_, i) => i !== index));
  const updateOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));

  const handleSubmit = () => {
    if (!name.trim()) return;
    const cleanOptions =
      type === "select"
        ? options.map((o) => o.trim()).filter(Boolean)
        : undefined;
    if (type === "select" && (!cleanOptions || cleanOptions.length === 0)) return;
    addProperty({ name: name.trim(), type, options: cleanOptions, is_required: required });
    setName("");
    setType("text");
    setOptions([""]);
    setRequired(false);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Add column"
          >
            <IconPlus size={14} />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3" align="start">
        <p className="text-sm font-medium">New Column</p>
        <Input
          placeholder="Column name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          autoFocus
        />
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v as PropertyType);
            if (v !== "select") setOptions([""]);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {type === "select" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Options</p>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-1">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (opt.trim()) addOption();
                    }
                  }}
                  className="h-7 text-xs"
                />
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <IconX size={12} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <IconPlus size={12} />
              Add option
            </button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <label htmlFor="add-col-required" className="text-xs text-muted-foreground">
            Required
          </label>
          <Switch
            id="add-col-required"
            checked={required}
            onCheckedChange={setRequired}
          />
        </div>
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="sm"
          disabled={!name.trim() || (type === "select" && options.every((o) => !o.trim()))}
        >
          Add Column
        </Button>
      </PopoverContent>
    </Popover>
  );
}
