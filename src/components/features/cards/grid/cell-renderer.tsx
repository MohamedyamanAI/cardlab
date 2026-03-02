"use client";

import type { Card, Property } from "@/lib/types";
import { useCardsStore } from "@/lib/store/cards-store";
import { TextCell } from "./cells/text-cell";
import { NumberCell } from "./cells/number-cell";
import { BooleanCell } from "./cells/boolean-cell";
import { SelectCell } from "./cells/select-cell";
import { ColorCell } from "./cells/color-cell";
import { ImageCell } from "./cells/image-cell";

interface CellRendererProps {
  card: Card;
  property: Property;
}

export function CellRenderer({ card, property }: CellRendererProps) {
  const { editingCell, startEditing, stopEditing, updateCell, focusedCell, setFocusedCell, cards } =
    useCardsStore();

  const isEditing =
    editingCell?.cardId === card.id && editingCell?.slug === property.slug;
  const initialKey = isEditing ? editingCell?.initialKey : undefined;

  const data =
    typeof card.data === "object" && card.data !== null
      ? (card.data as Record<string, unknown>)
      : {};
  const value = data[property.slug];

  const handleStartEdit = () => startEditing(card.id, property.slug);
  const handleCancel = () => stopEditing();

  const handleCommit = (newValue: unknown, moveDown?: boolean) => {
    stopEditing();
    if (newValue !== value) {
      updateCell(card.id, property.slug, newValue);
    }
    if (moveDown && focusedCell) {
      const nextRow = focusedCell.row + 1;
      if (nextRow < cards.length) {
        setFocusedCell(nextRow, focusedCell.col);
      }
    }
  };

  switch (property.type) {
    case "text":
      return (
        <TextCell
          value={value}
          isEditing={isEditing}
          initialKey={initialKey}
          onStartEdit={handleStartEdit}
          onCommit={handleCommit}
          onCancel={handleCancel}
        />
      );
    case "number":
      return (
        <NumberCell
          value={value}
          isEditing={isEditing}
          initialKey={initialKey}
          onStartEdit={handleStartEdit}
          onCommit={handleCommit}
          onCancel={handleCancel}
        />
      );
    case "boolean":
      return <BooleanCell value={value} onCommit={(v) => handleCommit(v)} />;
    case "select": {
      const options = Array.isArray(property.options)
        ? (property.options as string[])
        : [];
      return (
        <SelectCell value={value} options={options} onCommit={(v) => handleCommit(v)} />
      );
    }
    case "color":
      return <ColorCell value={value} onCommit={(v) => handleCommit(v)} />;
    case "image":
      return (
        <ImageCell
          value={value}
          isEditing={isEditing}
          onStartEdit={handleStartEdit}
          onCommit={handleCommit}
          onCancel={handleCancel}
        />
      );
    default:
      return (
        <TextCell
          value={value}
          isEditing={isEditing}
          initialKey={initialKey}
          onStartEdit={handleStartEdit}
          onCommit={handleCommit}
          onCancel={handleCancel}
        />
      );
  }
}
