"use client";

import { useEffect, useState } from "react";
import { useCardsStore } from "@/lib/store/cards-store";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useMediaResolution } from "@/hooks/use-media-resolution";
import type { Project, Card } from "@/lib/types";
import { ProjectSelector } from "./project-selector";
import { DeckSelector } from "./deck-selector";
import { CardsToolbar } from "./cards-toolbar";
import { CardsGrid } from "./grid/cards-grid";
import { CardLayoutPreview } from "./preview/card-layout-preview";
import { CardHistoryPanel } from "./history/card-history-panel";
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
  const { hydrate, selectedProjectId, cards, filteredCards, properties, isLoading, focusedCell, updateCardInStore } =
    useCardsStore();
  const loadLayouts = useLayoutEditorStore((s) => s.loadLayouts);
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [historyCardId, setHistoryCardId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const visibleCards = filteredCards();
  const hasContent = selectedProjectId && properties.length > 0 && visibleCards.length > 0;
  const canPreview = hasContent && layouts.length > 0;

  const historyCard = historyCardId
    ? visibleCards.find((c) => c.id === historyCardId) ?? null
    : null;

  const handleViewCardHistory = (card: Card) => {
    setHistoryCardId(card.id);
    setPreviewOpen(false);
  };

  const handleToggleHistory = () => {
    if (historyCardId) {
      setHistoryCardId(null);
    } else if (focusedCell) {
      const card = visibleCards[focusedCell.row];
      if (card) {
        setHistoryCardId(card.id);
        setPreviewOpen(false);
      }
    }
  };

  const handleTogglePreview = () => {
    setPreviewOpen((v) => !v);
    setHistoryCardId(null);
  };

  // When history panel is open, follow the focused row
  useEffect(() => {
    if (!historyCardId || !focusedCell) return;
    const card = visibleCards[focusedCell.row];
    if (card && card.id !== historyCardId) {
      setHistoryCardId(card.id); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [focusedCell, historyCardId, visibleCards]);

  const handleCloseHistory = () => setHistoryCardId(null);

  const showRightPanel = (previewOpen && canPreview) || historyCard;

  if (!mounted) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cards</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage your card data.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              onTogglePreview={canPreview ? handleTogglePreview : undefined}
              historyOpen={!!historyCardId}
              onToggleHistory={hasContent ? handleToggleHistory : undefined}
            />
          )}

          {/* Grid + optional card preview / history */}
          {hasContent ? (
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={showRightPanel ? 65 : 100} minSize={30}>
                  <div className="h-full overflow-hidden">
                    <CardsGrid onViewCardHistory={handleViewCardHistory} />
                  </div>
                </ResizablePanel>
                {showRightPanel && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={35} minSize={20}>
                      {historyCard ? (
                        <CardHistoryPanel
                          key={historyCard.id}
                          card={historyCard}
                          onRestored={(updated) => updateCardInStore(updated)}
                          onClose={handleCloseHistory}
                        />
                      ) : (
                        <div className="h-full bg-muted/30">
                          <CardLayoutPreview />
                        </div>
                      )}
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
