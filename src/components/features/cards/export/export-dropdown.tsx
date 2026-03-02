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

  const [exportScope, setExportScope] = useState<"all" | "selected">("all");

  const handleExportData = (format: "csv" | "json", scope: "all" | "selected") => {
    const exportCards = scope === "selected"
      ? cards.filter((c) => selectedCardIds.has(c.id))
      : selectedDeckId ? filteredCards() : cards;
    if (exportCards.length === 0) {
      toast.error("No cards to export");
      return;
    }
    if (format === "csv") {
      exportCSV(exportCards, properties, projectName);
    } else {
      exportJSON(exportCards, properties, projectName);
    }
    toast.success(`Exported ${exportCards.length} cards as ${format.toUpperCase()}`);
  };

  const handleVisualExport = (scope: "all" | "selected") => {
    setExportScope(scope);
    setDialogOpen(true);
  };

  const hasSelection = selectedCardIds.size > 0;

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
          <DropdownMenuLabel>Data Export</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleExportData("csv", "all")}>
            Export all as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportData("json", "all")}>
            Export all as JSON
          </DropdownMenuItem>
          {hasSelection && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                Selected ({selectedCardIds.size})
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExportData("csv", "selected")}>
                Export selected as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("json", "selected")}>
                Export selected as JSON
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Card Export</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleVisualExport("all")}>
            Export as Images / PDF…
          </DropdownMenuItem>
          {hasSelection && (
            <DropdownMenuItem onClick={() => handleVisualExport("selected")}>
              Export selected as Images / PDF…
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialScope={exportScope === "selected" ? "selected" : undefined}
      />
    </>
  );
}
