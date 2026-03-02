"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  IconCheck,
  IconX,
  IconArrowRight,
  IconColumns3,
  IconArrowBackUp,
} from "@tabler/icons-react";
import { buildColumns } from "@/lib/utils/import-parser";
import { buildDefaultMappings } from "../import-dialog";
import type {
  ParsedImportData,
  ColumnMapping,
} from "@/lib/types/import";
import type { Property, PropertyType } from "@/lib/types";

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "boolean", label: "Boolean" },
  { value: "color", label: "Color" },
  { value: "image", label: "Image" },
];

const PREVIEW_ROWS = 20;

interface MappingStepProps {
  parsedData: ParsedImportData;
  mappings: ColumnMapping[];
  existingProperties: Property[];
  onConfirm: (mappings: ColumnMapping[], dataRows: string[][]) => void;
  onBack: () => void;
}

function MappingLabel({ mapping }: { mapping: ColumnMapping }) {
  if (mapping.action === "skip") {
    return null;
  }
  if (mapping.action === "map_existing") {
    return (
      <div className="flex items-center gap-1">
        <IconArrowRight size={10} className="text-muted-foreground" />
        <span className="text-xs font-medium">
          {mapping.existingPropertySlug}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-medium text-primary">
        + {mapping.newPropertyName}
      </span>
      <Badge variant="secondary" className="px-1 py-0 text-[9px]">
        {mapping.newPropertyType}
      </Badge>
    </div>
  );
}

interface ColumnHeaderProps {
  columnName: string;
  mapping: ColumnMapping;
  inferredType: PropertyType;
  existingProperties: Property[];
  onUpdate: (partial: Partial<ColumnMapping>) => void;
  onSkip: () => void;
  onRestore: () => void;
}

function ColumnHeader({
  columnName,
  mapping,
  inferredType,
  existingProperties,
  onUpdate,
  onSkip,
  onRestore,
}: ColumnHeaderProps) {
  const [open, setOpen] = useState(false);

  const isSkipped = mapping.action === "skip";
  const isMapped = mapping.action === "map_existing";
  const isNew = mapping.action === "create_new";

  if (isSkipped) {
    return (
      <div className="flex w-full items-center gap-1 px-2 py-1.5 opacity-50">
        <div className="flex-1 min-w-0">
          <span className="truncate text-xs font-medium line-through">
            {columnName}
          </span>
          <p className="text-[10px] text-muted-foreground italic">Skipped</p>
        </div>
        <button
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onRestore}
          title="Restore column"
        >
          <IconArrowBackUp size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-1 px-2 py-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex flex-1 min-w-0 flex-col gap-0.5 rounded text-left transition-colors hover:bg-muted/60">
            <span className="truncate text-xs font-medium">{columnName}</span>
            <MappingLabel mapping={mapping} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Map &ldquo;{columnName}&rdquo; to
              </p>
              <Select
                value={
                  isMapped
                    ? `existing:${mapping.existingPropertySlug}`
                    : isNew
                      ? "create_new"
                      : "create_new"
                }
                onValueChange={(val) => {
                  if (val === "create_new") {
                    onUpdate({
                      action: "create_new",
                      newPropertyName: columnName,
                      newPropertyType: inferredType,
                      existingPropertySlug: undefined,
                    });
                  } else if (val.startsWith("existing:")) {
                    onUpdate({
                      action: "map_existing",
                      existingPropertySlug: val.slice(9),
                      newPropertyName: undefined,
                      newPropertyType: undefined,
                    });
                  }
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {existingProperties.map((prop) => (
                    <SelectItem
                      key={prop.slug}
                      value={`existing:${prop.slug}`}
                    >
                      {prop.name}{" "}
                      <span className="text-muted-foreground">
                        ({prop.type})
                      </span>
                    </SelectItem>
                  ))}
                  {existingProperties.length > 0 && <SelectSeparator />}
                  <SelectItem value="create_new">
                    + Create new property
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isNew && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  New property
                </p>
                <Input
                  className="h-8 text-xs"
                  placeholder="Property name"
                  value={mapping.newPropertyName ?? columnName}
                  onChange={(e) =>
                    onUpdate({ newPropertyName: e.target.value })
                  }
                />
                <Select
                  value={mapping.newPropertyType ?? inferredType}
                  onValueChange={(val) =>
                    onUpdate({ newPropertyType: val as PropertyType })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
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
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <button
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={onSkip}
        title="Skip column"
      >
        <IconX size={12} />
      </button>
    </div>
  );
}

export function ImportMappingStep({
  parsedData,
  mappings,
  existingProperties,
  onConfirm,
  onBack,
}: MappingStepProps) {
  const [headerRow, setHeaderRow] = useState(parsedData.headerRowIndex);
  const [localMappings, setLocalMappings] = useState<ColumnMapping[]>(mappings);
  // Per-column name overrides (set by clicking data cells)
  const [nameOverrides, setNameOverrides] = useState<Map<number, string>>(
    new Map()
  );

  // Derive columns and data rows from the selected header row + overrides
  const { columns, dataRows } = useMemo(() => {
    const raw = parsedData.rawRows;
    const headers = raw[headerRow] ?? [];
    const data = raw.slice(headerRow + 1);
    const baseColumns = buildColumns(headers, data);
    // Apply name overrides
    const cols = baseColumns.map((col, i) => {
      const override = nameOverrides.get(i);
      return override !== undefined ? { ...col, name: override } : col;
    });
    return { columns: cols, dataRows: data };
  }, [parsedData.rawRows, headerRow, nameOverrides]);

  const handleHeaderRowChange = useCallback(
    (newRow: number) => {
      if (newRow === headerRow) return;
      setHeaderRow(newRow);
      setNameOverrides(new Map()); // reset overrides on header row change
      const raw = parsedData.rawRows;
      const headers = raw[newRow] ?? [];
      const data = raw.slice(newRow + 1);
      const newColumns = buildColumns(headers, data);
      setLocalMappings(buildDefaultMappings(newColumns, existingProperties));
    },
    [headerRow, parsedData.rawRows, existingProperties]
  );

  const handleCellClick = useCallback(
    (rawRowIndex: number, colIndex: number) => {
      // Only allow clicking cells below the header row
      if (rawRowIndex <= headerRow) return;
      const cellValue = parsedData.rawRows[rawRowIndex]?.[colIndex] ?? "";
      if (!cellValue.trim()) return;

      // Set the cell content as the column name
      setNameOverrides((prev) => {
        const next = new Map(prev);
        next.set(colIndex, cellValue.trim());
        return next;
      });

      // Update mapping to "create_new" with the cell value as name
      setLocalMappings((prev) =>
        prev.map((m, i) =>
          i === colIndex
            ? {
                ...m,
                action: "create_new" as const,
                newPropertyName: cellValue.trim(),
                newPropertyType: m.newPropertyType ?? columns[colIndex]?.inferredType ?? "text",
                existingPropertySlug: undefined,
              }
            : m
        )
      );
    },
    [headerRow, parsedData.rawRows, columns]
  );

  const updateMapping = (index: number, partial: Partial<ColumnMapping>) => {
    setLocalMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...partial } : m))
    );
  };

  const skipColumn = (index: number) => {
    setLocalMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, action: "skip" as const } : m))
    );
  };

  const restoreColumn = (index: number) => {
    const col = columns[index];
    if (!col) return;
    // Try auto-match, fallback to create_new
    const match = existingProperties.find(
      (p) =>
        p.name.toLowerCase() === col.name.toLowerCase() ||
        p.slug === col.name.toLowerCase().replace(/\s+/g, "-")
    );
    if (match) {
      setLocalMappings((prev) =>
        prev.map((m, i) =>
          i === index
            ? {
                ...m,
                action: "map_existing" as const,
                existingPropertySlug: match.slug,
              }
            : m
        )
      );
    } else {
      setLocalMappings((prev) =>
        prev.map((m, i) =>
          i === index
            ? {
                ...m,
                action: "create_new" as const,
                newPropertyName: col.name,
                newPropertyType: col.inferredType,
                existingPropertySlug: undefined,
              }
            : m
        )
      );
    }
  };

  const activeMappingCount = localMappings.filter(
    (m) => m.action !== "skip"
  ).length;

  const rawRows = parsedData.rawRows;
  const displayRows = rawRows.slice(0, PREVIEW_ROWS + 1);
  const totalRawRows = rawRows.length;
  const colCount = rawRows[0]?.length ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Scrollable data table */}
      <div className="min-h-0 flex-1 overflow-auto rounded-lg border">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              <th className="sticky left-0 z-20 w-10 border-r border-border/50 bg-muted px-2 py-1 text-center text-[10px] font-medium text-muted-foreground">
                #
              </th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="min-w-[140px] border-r border-border/50 p-0"
                >
                  <ColumnHeader
                    columnName={col.name}
                    mapping={localMappings[i]}
                    inferredType={col.inferredType}
                    existingProperties={existingProperties}
                    onUpdate={(partial) => updateMapping(i, partial)}
                    onSkip={() => skipColumn(i)}
                    onRestore={() => restoreColumn(i)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rawIndex) => {
              const isHeader = rawIndex === headerRow;
              const isAboveHeader = rawIndex < headerRow;

              return (
                <tr
                  key={rawIndex}
                  className={`border-t border-border/30 ${
                    isHeader
                      ? "bg-primary/10 font-medium"
                      : isAboveHeader
                        ? "opacity-40"
                        : ""
                  }`}
                >
                  <td
                    className="sticky left-0 z-10 cursor-pointer border-r border-border/50 bg-background px-2 py-1.5 text-center text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    title="Click to set as header row"
                    onClick={() => handleHeaderRowChange(rawIndex)}
                  >
                    {isHeader ? (
                      <IconColumns3
                        size={12}
                        className="mx-auto text-primary"
                      />
                    ) : (
                      rawIndex + 1
                    )}
                  </td>
                  {Array.from({ length: colCount }, (_, colIndex) => {
                    const isSkipped =
                      !isHeader &&
                      !isAboveHeader &&
                      localMappings[colIndex]?.action === "skip";
                    const isDataCell = !isHeader && !isAboveHeader;
                    return (
                      <td
                        key={colIndex}
                        className={`border-r border-border/50 px-2 py-1.5 ${
                          isSkipped
                            ? "text-muted-foreground/40 line-through"
                            : ""
                        } ${isHeader ? "text-primary" : ""} ${
                          isDataCell
                            ? "cursor-pointer hover:bg-primary/5"
                            : ""
                        }`}
                        onClick={
                          isDataCell
                            ? () => handleCellClick(rawIndex, colIndex)
                            : undefined
                        }
                        title={
                          isDataCell
                            ? "Click to use as column name"
                            : undefined
                        }
                      >
                        <span className="line-clamp-1">
                          {row[colIndex] ?? ""}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalRawRows > displayRows.length && (
        <p className="shrink-0 text-center text-xs text-muted-foreground">
          Showing {displayRows.length} of {totalRawRows} rows (
          {dataRows.length} data rows)
        </p>
      )}

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconCheck size={12} className="text-green-500" />
              {activeMappingCount} mapped
            </span>
            {columns.length - activeMappingCount > 0 && (
              <span className="flex items-center gap-1">
                <IconX size={12} className="text-muted-foreground" />
                {columns.length - activeMappingCount} skipped
              </span>
            )}
          </div>
          <Button
            onClick={() => onConfirm(localMappings, dataRows)}
            disabled={activeMappingCount === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
