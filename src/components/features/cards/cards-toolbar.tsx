"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCardsStore } from "@/lib/store/cards-store";
import { AddColumnPopover } from "./add-column-popover";
import { ImportDialog } from "./import-dialog";
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconLayoutSidebar,
  IconFileImport,
} from "@tabler/icons-react";

interface CardsToolbarProps {
  previewOpen?: boolean;
  onTogglePreview?: () => void;
}

export function CardsToolbar({ previewOpen, onTogglePreview }: CardsToolbarProps) {
  const {
    filteredCards,
    selectedCardIds,
    selectedProjectId,
    addCard,
    deleteSelectedCards,
    duplicateSelectedCards,
  } = useCardsStore();
  const cards = filteredCards();
  const [importOpen, setImportOpen] = useState(false);

  if (!selectedProjectId) return null;

  const selectionCount = selectedCardIds.size;

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={addCard}>
        <IconPlus size={14} className="mr-1.5" />
        Add Row
      </Button>

      <AddColumnPopover>
        <Button size="sm" variant="outline">
          <IconPlus size={14} className="mr-1.5" />
          Add Column
        </Button>
      </AddColumnPopover>

      <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
        <IconFileImport size={14} className="mr-1.5" />
        Import
      </Button>
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

      {selectionCount > 0 && (
        <>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button
            size="sm"
            variant="outline"
            onClick={duplicateSelectedCards}
          >
            <IconCopy size={14} className="mr-1.5" />
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={deleteSelectedCards}
          >
            <IconTrash size={14} className="mr-1.5" />
            Delete
          </Button>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {cards.length} card{cards.length !== 1 ? "s" : ""}
          {selectionCount > 0 && ` \u00B7 ${selectionCount} selected`}
        </span>
        {onTogglePreview && (
          <Button
            size="sm"
            variant={previewOpen ? "secondary" : "outline"}
            onClick={onTogglePreview}
            title={previewOpen ? "Hide preview" : "Show preview"}
          >
            <IconLayoutSidebar size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
