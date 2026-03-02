"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { isLayoutCondition } from "@/lib/utils/condition-engine";
import {
  OPERATORS_BY_TYPE,
  OPERATOR_LABELS,
  VALUE_LESS_OPERATORS,
  type ComparisonOperator,
  type LayoutCondition,
} from "@/lib/types/conditions";
import type { Property } from "@/lib/types";
import { IconFilter } from "@tabler/icons-react";

export function ConditionEditor() {
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);
  const updateLayoutCondition = useLayoutEditorStore(
    (s) => s.updateLayoutCondition
  );
  const properties = useCardsStore((s) => s.properties);

  const currentLayout = layouts.find((l) => l.id === currentLayoutId) ?? null;
  const rawCondition = currentLayout?.condition ?? null;
  const existing = isLayoutCondition(rawCondition)
    ? (rawCondition as unknown as LayoutCondition)
    : null;

  const [field, setField] = useState<string>("");
  const [operator, setOperator] = useState<ComparisonOperator>("eq");
  const [value, setValue] = useState<string>("");
  const [open, setOpen] = useState(false);

  // Sync local state from layout when switching layouts or opening
  useEffect(() => {
    if (existing) {
      setField(existing.field);
      setOperator(existing.operator);
      setValue(existing.value != null ? String(existing.value) : "");
    } else {
      setField("");
      setOperator("eq");
      setValue("");
    }
  }, [currentLayoutId, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedProperty = properties.find((p) => p.slug === field) ?? null;
  const availableOperators = selectedProperty
    ? OPERATORS_BY_TYPE[selectedProperty.type]
    : [];
  const needsValue = !VALUE_LESS_OPERATORS.includes(operator);

  function handleFieldChange(slug: string) {
    setField(slug);
    const prop = properties.find((p) => p.slug === slug);
    if (prop) {
      const ops = OPERATORS_BY_TYPE[prop.type];
      if (!ops.includes(operator)) {
        setOperator(ops[0]);
      }
    }
    setValue("");
  }

  function handleApply() {
    if (!currentLayoutId || !field || !operator) return;

    const prop = selectedProperty;
    let typedValue: string | number | boolean | null = null;

    if (needsValue) {
      if (prop?.type === "number") {
        typedValue = value === "" ? null : Number(value);
      } else if (prop?.type === "boolean") {
        typedValue = value === "true";
      } else {
        typedValue = value;
      }
    }

    const condition: LayoutCondition = {
      field,
      operator,
      ...(needsValue ? { value: typedValue } : {}),
    };
    updateLayoutCondition(
      currentLayoutId,
      condition as unknown as import("@/lib/supabase/database.types").Json
    );
    setOpen(false);
  }

  function handleClear() {
    if (!currentLayoutId) return;
    updateLayoutCondition(currentLayoutId, null);
    setField("");
    setOperator("eq");
    setValue("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <IconFilter className="size-4" />
          {existing ? (
            <Badge variant="secondary" className="text-[10px]">
              {existing.field} {OPERATOR_LABELS[existing.operator]}
              {!VALUE_LESS_OPERATORS.includes(existing.operator) &&
                existing.value != null &&
                ` ${existing.value}`}
            </Badge>
          ) : (
            "Condition"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Property</Label>
          <Select value={field || "__none__"} onValueChange={handleFieldChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select property..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__" disabled>
                Select property...
              </SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {field && availableOperators.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs">Operator</Label>
            <Select
              value={operator}
              onValueChange={(v) => setOperator(v as ComparisonOperator)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableOperators.map((op) => (
                  <SelectItem key={op} value={op}>
                    {OPERATOR_LABELS[op]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {field && needsValue && (
          <div className="space-y-1.5">
            <Label className="text-xs">Value</Label>
            <ValueInput
              property={selectedProperty}
              value={value}
              onChange={setValue}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!field || (needsValue && !value && selectedProperty?.type !== "boolean")}
            className="flex-1"
          >
            Apply
          </Button>
          {existing && (
            <Button size="sm" variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ValueInput({
  property,
  value,
  onChange,
}: {
  property: Property | null;
  value: string;
  onChange: (v: string) => void;
}) {
  if (!property) return <Input className="h-8 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />;

  if (property.type === "select") {
    const options = Array.isArray(property.options)
      ? (property.options as string[])
      : [];
    return (
      <Select value={value || "__none__"} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Select value..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__" disabled>
            Select value...
          </SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (property.type === "boolean") {
    return (
      <Select value={value || "true"} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (property.type === "number") {
    return (
      <Input
        type="number"
        className="h-8 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (property.type === "color") {
    return (
      <Input
        type="color"
        className="h-8 w-full text-sm"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <Input
      className="h-8 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter value..."
    />
  );
}
