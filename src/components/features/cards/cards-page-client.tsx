"use client";

import { useEffect, useState } from "react";
import { useCardsStore } from "@/lib/store/cards-store";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useMediaResolution } from "@/hooks/use-media-resolution";
import type { Project } from "@/lib/types";
import { ProjectSelector } from "./project-selector";
import { DeckSelector } from "./deck-selector";
import { CardsToolbar } from "./cards-toolbar";
import { CardsGrid } from "./cards-grid";
import { CardLayoutPreview } from "./card-layout-preview";
import { EmptyState } from "./empty-state";
import { LayoutEditor } from "@/components/features/layouts/layout-editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

interface CardsPageClientProps {
  initialProjects: Project[];
}

export function CardsPageClient({ initialProjects }: CardsPageClientProps) {
  const { hydrate, selectedProjectId, cards, properties, isLoading } =
    useCardsStore();
  const loadLayouts = useLayoutEditorStore((s) => s.loadLayouts);
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const [previewOpen, setPreviewOpen] = useState(true);

  useEffect(() => {
    hydrate(initialProjects);
  }, [hydrate, initialProjects]);

  // Load layouts for the selected project (needed for card preview in Data tab)
  useEffect(() => {
    if (selectedProjectId && layouts.length === 0) {
      loadLayouts(selectedProjectId);
    }
  }, [selectedProjectId, loadLayouts, layouts.length]);

  useMediaResolution();

  const hasContent = selectedProjectId && properties.length > 0 && cards.length > 0;
  const canPreview = hasContent && layouts.length > 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Tabs */}
      <Tabs defaultValue="data" className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cards</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage your card data.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TabsList>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>
            <DeckSelector />
            <ProjectSelector />
          </div>
        </div>

        <TabsContent value="data" className="flex flex-1 flex-col gap-4 overflow-hidden">
          {/* Toolbar - only show when project is selected */}
          {selectedProjectId && !isLoading && properties.length > 0 && (
            <CardsToolbar
              previewOpen={canPreview ? previewOpen : false}
              onTogglePreview={canPreview ? () => setPreviewOpen((v) => !v) : undefined}
            />
          )}

          {/* Grid + optional card preview */}
          {hasContent ? (
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={previewOpen ? 65 : 100} minSize={30}>
                  <div className="h-full overflow-hidden">
                    <CardsGrid />
                  </div>
                </ResizablePanel>
                {previewOpen && canPreview && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={35} minSize={20}>
                      <div className="h-full bg-muted/30">
                        <CardLayoutPreview />
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        <TabsContent value="layout" className="flex-1 overflow-hidden">
          <LayoutEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
