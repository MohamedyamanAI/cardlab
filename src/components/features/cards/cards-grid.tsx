"use client";

import { useMemo, useCallback, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useCardsStore } from "@/lib/store/cards-store";
import { buildColumns } from "./columns";
import { AddColumnPopover } from "./add-column-popover";

function isPrintableKey(e: React.KeyboardEvent): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return e.key.length === 1;
}

export function CardsGrid() {
  const {
    properties,
    cards,
    selectedCardIds,
    toggleCardSelection,
    selectAllCards,
    clearSelection,
    focusedCell,
    setFocusedCell,
    clearFocusedCell,
    editingCell,
    startEditing,
    stopEditing,
    updateCell,
  } = useCardsStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Refocus the grid container when editing ends so arrow keys work immediately
  const prevEditingRef = useRef(editingCell);
  useEffect(() => {
    const wasEditing = prevEditingRef.current;
    prevEditingRef.current = editingCell;
    // Editing just ended and we still have a focused cell
    if (wasEditing && !editingCell && focusedCell) {
      requestAnimationFrame(() => {
        containerRef.current?.focus();
      });
    }
  }, [editingCell, focusedCell]);

  const sortedProperties = useMemo(
    () =>
      [...properties].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      ),
    [properties]
  );

  const columns = useMemo(() => buildColumns(properties), [properties]);

  const rowSelection: RowSelectionState = useMemo(() => {
    const sel: RowSelectionState = {};
    cards.forEach((card, index) => {
      if (selectedCardIds.has(card.id)) {
        sel[index] = true;
      }
    });
    return sel;
  }, [cards, selectedCardIds]);

  const table = useReactTable({
    data: cards,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;

      const allSelected =
        Object.keys(newSelection).length === cards.length &&
        Object.values(newSelection).every(Boolean);
      const noneSelected =
        Object.keys(newSelection).length === 0 ||
        Object.values(newSelection).every((v) => !v);

      if (allSelected) {
        selectAllCards();
      } else if (noneSelected) {
        clearSelection();
      } else {
        cards.forEach((card, index) => {
          const isNowSelected = !!newSelection[index];
          const wasSelected = selectedCardIds.has(card.id);
          if (isNowSelected !== wasSelected) {
            toggleCardSelection(card.id);
          }
        });
      }
    },
    columnResizeMode: "onChange",
  });

  const totalRows = cards.length;
  const totalCols = sortedProperties.length;

  // Navigate focus: clamps to grid bounds
  const moveFocus = useCallback(
    (row: number, col: number) => {
      const r = Math.max(0, Math.min(totalRows - 1, row));
      const c = Math.max(0, Math.min(totalCols - 1, col));
      setFocusedCell(r, c);
    },
    [totalRows, totalCols, setFocusedCell]
  );

  // Start editing the cell at (row, col), optionally with a typed character
  const editAt = useCallback(
    (row: number, col: number, initialKey?: string) => {
      if (row < cards.length && col < sortedProperties.length) {
        startEditing(cards[row].id, sortedProperties[col].slug, initialKey);
      }
    },
    [cards, sortedProperties, startEditing]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // ── While editing ──────────────────────────────────────
      if (editingCell) {
        // Tab: commit + move right/left
        if (e.key === "Tab") {
          e.preventDefault();
          // The blur on the input will commit. We just move focus.
          stopEditing();
          if (focusedCell) {
            if (e.shiftKey) {
              if (focusedCell.col > 0)
                moveFocus(focusedCell.row, focusedCell.col - 1);
              else if (focusedCell.row > 0)
                moveFocus(focusedCell.row - 1, totalCols - 1);
            } else {
              if (focusedCell.col < totalCols - 1)
                moveFocus(focusedCell.row, focusedCell.col + 1);
              else if (focusedCell.row < totalRows - 1)
                moveFocus(focusedCell.row + 1, 0);
            }
          }
        }
        // All other keys are handled by the input itself
        return;
      }

      // ── No cell focused ────────────────────────────────────
      if (!focusedCell) {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(
            e.key
          )
        ) {
          e.preventDefault();
          if (totalRows > 0 && totalCols > 0) moveFocus(0, 0);
        }
        return;
      }

      // ── Cell focused, not editing ──────────────────────────
      const { row, col } = focusedCell;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          moveFocus(row - 1, col);
          break;
        case "ArrowDown":
          e.preventDefault();
          moveFocus(row + 1, col);
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveFocus(row, col - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          moveFocus(row, col + 1);
          break;

        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            if (col > 0) moveFocus(row, col - 1);
            else if (row > 0) moveFocus(row - 1, totalCols - 1);
          } else {
            if (col < totalCols - 1) moveFocus(row, col + 1);
            else if (row < totalRows - 1) moveFocus(row + 1, 0);
          }
          break;

        case "Enter":
          e.preventDefault();
          editAt(row, col);
          break;

        case "F2":
          e.preventDefault();
          editAt(row, col);
          break;

        case "Delete":
        case "Backspace":
          e.preventDefault();
          // Clear cell value
          if (row < cards.length && col < sortedProperties.length) {
            updateCell(cards[row].id, sortedProperties[col].slug, null);
          }
          break;

        case "Escape":
          e.preventDefault();
          clearFocusedCell();
          break;

        default:
          // Type-to-edit: any printable character starts editing with that character
          if (isPrintableKey(e)) {
            e.preventDefault();
            const prop = sortedProperties[col];
            // Only type-to-edit for text/number types
            if (
              prop &&
              (prop.type === "text" ||
                prop.type === "number")
            ) {
              editAt(row, col, e.key);
            }
          }
          break;
      }
    },
    [
      focusedCell,
      editingCell,
      totalRows,
      totalCols,
      cards,
      sortedProperties,
      moveFocus,
      editAt,
      stopEditing,
      clearFocusedCell,
      updateCell,
    ]
  );

  const handleCellClick = useCallback(
    (rowIndex: number, colIndex: number) => {
      // If already focused on this cell, start editing (double-click feel via single)
      if (
        focusedCell?.row === rowIndex &&
        focusedCell?.col === colIndex
      ) {
        editAt(rowIndex, colIndex);
      } else {
        setFocusedCell(rowIndex, colIndex);
      }
    },
    [setFocusedCell, focusedCell, editAt]
  );

  const handleDoubleClick = useCallback(
    (rowIndex: number, colIndex: number) => {
      setFocusedCell(rowIndex, colIndex);
      editAt(rowIndex, colIndex);
    },
    [setFocusedCell, editAt]
  );

  if (properties.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="min-h-0 overflow-auto outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <table
        className="w-full border-collapse"
        style={{ width: table.getCenterTotalSize() }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b bg-muted/40">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="relative px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary/40"
                    />
                  )}
                </th>
              ))}
              <th className="w-10 px-2 py-2">
                <AddColumnPopover />
              </th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr
              key={row.id}
              className="border-b border-border/50 hover:bg-muted/20"
              data-selected={row.getIsSelected() || undefined}
            >
              {row.getVisibleCells().map((cell, cellIndex) => {
                const propColIndex = cellIndex - 1;
                const isFocused =
                  focusedCell !== null &&
                  focusedCell.row === rowIndex &&
                  focusedCell.col === propColIndex;

                return (
                  <td
                    key={cell.id}
                    className={`py-1 text-sm ${
                      propColIndex >= 0 ? "px-1" : "px-3"
                    } ${isFocused ? "outline outline-2 -outline-offset-2 outline-primary" : ""}`}
                    style={{ width: cell.column.getSize() }}
                    onClick={
                      propColIndex >= 0
                        ? () => handleCellClick(rowIndex, propColIndex)
                        : undefined
                    }
                    onDoubleClick={
                      propColIndex >= 0
                        ? () => handleDoubleClick(rowIndex, propColIndex)
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
              <td className="w-10" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
