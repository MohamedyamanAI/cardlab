"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Card, Property } from "@/lib/types";
import { CellRenderer } from "./cell-renderer";
import { ColumnHeader } from "./column-header";
import { Checkbox } from "@/components/ui/checkbox";

export function buildColumns(properties: Property[]): ColumnDef<Card>[] {
  const selectColumn: ColumnDef<Card> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 40,
    enableResizing: false,
  };

  const sorted = [...properties].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const propertyColumns: ColumnDef<Card>[] = sorted.map((prop) => ({
    id: prop.slug,
    accessorFn: (row) => {
      const data =
        typeof row.data === "object" && row.data !== null
          ? (row.data as Record<string, unknown>)
          : {};
      return data[prop.slug];
    },
    header: () => <ColumnHeader property={prop} />,
    cell: ({ row }) => <CellRenderer card={row.original} property={prop} />,
    size:
      prop.type === "boolean"
        ? 80
        : prop.type === "color"
          ? 120
          : prop.type === "number"
            ? 100
            : 200,
    enableResizing: true,
  }));

  return [selectColumn, ...propertyColumns];
}
