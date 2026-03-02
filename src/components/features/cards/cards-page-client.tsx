"use client";

import { useEffect } from "react";
import { useCardsStore } from "@/lib/store/cards-store";
import type { Project } from "@/lib/types";
import { ProjectSelector } from "./project-selector";
import { CardsToolbar } from "./cards-toolbar";
import { CardsGrid } from "./cards-grid";
import { EmptyState } from "./empty-state";

interface CardsPageClientProps {
  initialProjects: Project[];
}

export function CardsPageClient({ initialProjects }: CardsPageClientProps) {
  const { hydrate, selectedProjectId, cards, properties, isLoading } =
    useCardsStore();

  useEffect(() => {
    hydrate(initialProjects);
  }, [hydrate, initialProjects]);

  const hasContent = selectedProjectId && properties.length > 0 && cards.length > 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cards</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your card data.
          </p>
        </div>
        <ProjectSelector />
      </div>

      {/* Toolbar - only show when project is selected */}
      {selectedProjectId && !isLoading && properties.length > 0 && (
        <CardsToolbar />
      )}

      {/* Grid or Empty State */}
      {hasContent ? <CardsGrid /> : <EmptyState />}
    </div>
  );
}
