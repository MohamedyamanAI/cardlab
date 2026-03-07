"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCardsStore } from "@/lib/store/cards-store";
import { AddColumnPopover } from "./grid/add-column-popover";
import { ImportDialog } from "./import/import-dialog";
import { DesignImportDialog } from "./design-import/design-import-dialog";
import { ExportDropdown } from "./export/export-dropdown";
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconEye,
  IconFileImport,
  IconHistory,
  IconTable,
  IconPalette,
} from "@tabler/icons-react";

interface CardsToolbarProps {
  previewOpen?: boolean;
  onTogglePreview?: () => void;
  historyOpen?: boolean;
  onToggleHistory?: () => void;
}

export function CardsToolbar({ previewOpen, onTogglePreview, historyOpen, onToggleHistory }: CardsToolbarProps) {
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
  const [designImportOpen, setDesignImportOpen] = useState(false);

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <IconFileImport size={14} className="mr-1.5" />
            Import
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setImportOpen(true)}>
            <IconTable size={14} className="mr-2" />
            From CSV/JSON...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDesignImportOpen(true)}>
            <IconPalette size={14} className="mr-2" />
            From Design File (.ai)...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <DesignImportDialog open={designImportOpen} onOpenChange={setDesignImportOpen} />

      <ExportDropdown />

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
        {onToggleHistory && (
          <Button
            size="sm"
            variant={historyOpen ? "secondary" : "outline"}
            onClick={onToggleHistory}
          >
            <IconHistory size={14} className="mr-1.5" />
            History
          </Button>
        )}
        {onTogglePreview && (
          <Button
            size="sm"
            variant={previewOpen ? "secondary" : "outline"}
            onClick={onTogglePreview}
          >
            <IconEye size={14} className="mr-1.5" />
            Preview
          </Button>
        )}
      </div>
    </div>
  );
}
