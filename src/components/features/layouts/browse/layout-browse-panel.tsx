"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { LayoutThumbnail } from "./layout-thumbnail";
import { CreateLayoutDialog } from "../create-layout-dialog";
import {
  LAYOUT_TEMPLATES,
  cloneTemplateElements,
  type LayoutTemplate,
} from "../templates/layout-templates";
import * as layoutActions from "@/lib/actions/layouts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconChevronDown, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import type { CanvasElement } from "@/lib/types/canvas-elements";

interface LayoutBrowsePanelProps {
  onSelectLayout: (layoutId: string) => void;
}

export function LayoutBrowsePanel({ onSelectLayout }: LayoutBrowsePanelProps) {
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const createLayout = useLayoutEditorStore((s) => s.createLayout);
  const loadLayouts = useLayoutEditorStore((s) => s.loadLayouts);
  const selectedProjectId = useCardsStore((s) => s.selectedProjectId);
  const [showCreate, setShowCreate] = useState(false);
  const [cloningId, setCloningId] = useState<string | null>(null);

  const groupedTemplates = useMemo(() => {
    const map = new Map<string, LayoutTemplate[]>();
    for (const t of LAYOUT_TEMPLATES) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, []);

  const handleSelectTemplate = async (template: LayoutTemplate) => {
    if (!selectedProjectId || cloningId) return;
    setCloningId(template.id);

    try {
      const layout = await createLayout({
        project_id: selectedProjectId,
        name: template.name,
        width: template.width,
        height: template.height,
      });

      if (layout) {
        const cloned = cloneTemplateElements(template.elements);
        const saveResult = await layoutActions.saveCanvasElements(
          layout.id,
          cloned
        );

        if (!saveResult.success) {
          toast.error("Failed to save template elements");
        }

        // Reload so the store has the full layout with elements
        await loadLayouts(selectedProjectId);
        onSelectLayout(layout.id);
      }
    } finally {
      setCloningId(null);
    }
  };

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-8 p-6">
        {/* Your Layouts */}
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Your Layouts
            {layouts.length > 0 && (
              <span className="ml-2 text-xs">({layouts.length})</span>
            )}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
            {layouts.map((layout) => {
              const elements = Array.isArray(layout.canvas_elements)
                ? (layout.canvas_elements as unknown as CanvasElement[])
                : [];
              return (
                <LayoutThumbnail
                  key={layout.id}
                  name={layout.name}
                  width={layout.width ?? 825}
                  height={layout.height ?? 1125}
                  elements={elements}
                  onClick={() => onSelectLayout(layout.id)}
                />
              );
            })}
            {/* New Layout card */}
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <IconPlus className="size-6" />
              <span className="text-sm">New Layout</span>
            </button>
          </div>
        </section>

        {/* Templates grouped by category */}
        {Array.from(groupedTemplates.entries()).map(
          ([category, templates]) => (
            <TemplateCategorySection
              key={category}
              category={category}
              templates={templates}
              cloningId={cloningId}
              onSelect={handleSelectTemplate}
            />
          )
        )}
        {cloningId && (
          <p className="mt-2 text-xs text-muted-foreground">
            Creating layout from template...
          </p>
        )}
      </div>

      <CreateLayoutDialog open={showCreate} onOpenChange={setShowCreate} />
    </ScrollArea>
  );
}

// ── Collapsible template category ─────────────────────────────────

interface TemplateCategorySectionProps {
  category: string;
  templates: LayoutTemplate[];
  cloningId: string | null;
  onSelect: (template: LayoutTemplate) => void;
}

function TemplateCategorySection({
  category,
  templates,
  cloningId,
  onSelect,
}: TemplateCategorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState<number | null>(null);

  const measureRow = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const first = grid.children[0] as HTMLElement | undefined;
    if (!first) return;
    // One row = first item height + grid gap
    const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
    setRowHeight(first.offsetHeight + gap);
  }, []);

  useEffect(() => {
    measureRow();
    const observer = new ResizeObserver(measureRow);
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [measureRow]);

  const needsCollapse = rowHeight !== null && templates.length > 0 && gridRef.current
    ? gridRef.current.scrollHeight > rowHeight + 4
    : false;

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        {category} Templates
        <span className="ml-2 text-xs">({templates.length})</span>
      </h3>
      <div
        ref={gridRef}
        className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 overflow-hidden transition-[max-height] duration-300"
        style={{
          maxHeight:
            expanded || !needsCollapse
              ? gridRef.current?.scrollHeight ?? "none"
              : rowHeight ?? "none",
        }}
      >
        {templates.map((template) => (
          <LayoutThumbnail
            key={template.id}
            name={template.name}
            description={template.description}
            width={template.width}
            height={template.height}
            elements={template.elements}
            isTemplate
            onClick={() => !cloningId && onSelect(template)}
          />
        ))}
      </div>
      {needsCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconChevronDown
            className="size-3.5 transition-transform duration-200"
            style={{ transform: expanded ? "rotate(180deg)" : undefined }}
          />
          {expanded ? "Show less" : `View all ${templates.length} templates`}
        </button>
      )}
    </section>
  );
}
