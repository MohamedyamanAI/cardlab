"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCardsStore } from "@/lib/store/cards-store";
import { exportCSV, exportJSON } from "@/lib/utils/export-data";
import { ExportDialog } from "./export-dialog";
import { IconFileExport } from "@tabler/icons-react";
import { toast } from "sonner";

export function ExportDropdown() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    cards,
    filteredCards,
    selectedCardIds,
    selectedProjectId,
    projects,
    properties,
    selectedDeckId,
  } = useCardsStore();

  if (!selectedProjectId) return null;

  const project = projects.find((p) => p.id === selectedProjectId);
  const projectName = project?.name ?? "cards";

  function getExportCards() {
    if (selectedCardIds.size > 0) {
      return cards.filter((c) => selectedCardIds.has(c.id));
    }
    if (selectedDeckId) {
      return filteredCards();
    }
    return cards;
  }

  function getScopeLabel() {
    if (selectedCardIds.size > 0) return `${selectedCardIds.size} selected`;
    if (selectedDeckId) return "current deck";
    return "all cards";
  }

  const handleCSV = () => {
    const exportCards = getExportCards();
    if (exportCards.length === 0) {
      toast.error("No cards to export");
      return;
    }
    exportCSV(exportCards, properties, projectName);
    toast.success(`Exported ${exportCards.length} cards as CSV`);
  };

  const handleJSON = () => {
    const exportCards = getExportCards();
    if (exportCards.length === 0) {
      toast.error("No cards to export");
      return;
    }
    exportJSON(exportCards, properties, projectName);
    toast.success(`Exported ${exportCards.length} cards as JSON`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <IconFileExport size={14} className="mr-1.5" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>
            Data Export ({getScopeLabel()})
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCSV}>
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleJSON}>
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Card Export</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            Export as Images / PDF…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ExportDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
