"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCardsStore } from "@/lib/store/cards-store";
import { CreateProjectDialog } from "./create-project-dialog";
import { IconCards, IconFolderPlus, IconPlus, IconFileImport } from "@tabler/icons-react";
import { ImportDialog } from "./import-dialog";

export function EmptyState() {
  const { projects, selectedProjectId, cards, properties, addCard, isLoading } =
    useCardsStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // No projects at all
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconFolderPlus
          size={48}
          className="text-muted-foreground/50"
          stroke={1.5}
        />
        <h3 className="mt-4 text-lg font-medium">No projects yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first project to start managing cards.
        </p>
        <Button className="mt-4" onClick={() => setCreateOpen(true)}>
          <IconPlus size={16} className="mr-1.5" />
          Create Project
        </Button>
        <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  // No project selected
  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconCards
          size={48}
          className="text-muted-foreground/50"
          stroke={1.5}
        />
        <h3 className="mt-4 text-lg font-medium">Select a project</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a project from the dropdown to view and manage its cards.
        </p>
      </div>
    );
  }

  // Project selected but no properties
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconCards
          size={48}
          className="text-muted-foreground/50"
          stroke={1.5}
        />
        <h3 className="mt-4 text-lg font-medium">Define your card schema</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add columns to define what properties your cards will have, or import
          from a file.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setImportOpen(true)}
        >
          <IconFileImport size={16} className="mr-1.5" />
          Import Cards
        </Button>
        <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      </div>
    );
  }

  // Project selected, has properties, but no cards
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconCards
          size={48}
          className="text-muted-foreground/50"
          stroke={1.5}
        />
        <h3 className="mt-4 text-lg font-medium">No cards yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first card or import from a file.
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={addCard}>
            <IconPlus size={16} className="mr-1.5" />
            Add Card
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <IconFileImport size={16} className="mr-1.5" />
            Import
          </Button>
        </div>
        <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      </div>
    );
  }

  return null;
}
