"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { PositionSection } from "../property-sections/position-section";
import { BindingSection } from "../property-sections/binding-section";
import { AppearanceSection } from "../property-sections/appearance-section";
import { ShadowSection } from "../property-sections/shadow-section";
import { TextStyleSection } from "../property-sections/text-style-section";
import { ImageStyleSection } from "../property-sections/image-style-section";
import { ShapeStyleSection } from "../property-sections/shape-style-section";
import { CanvasSizeSection } from "../property-sections/canvas-size-section";
import { AlignmentToolbar } from "./alignment-toolbar";

export function PropertiesPanel() {
  const elements = useLayoutEditorStore((s) => s.elements);
  const selectedElementIds = useLayoutEditorStore((s) => s.selectedElementIds);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);
  const properties = useCardsStore((s) => s.properties);

  const selectedCount = selectedElementIds.size;

  // For single selection, get the element
  const element =
    selectedCount === 1
      ? elements.find((el) => selectedElementIds.has(el.id))
      : undefined;

  // Multi-select: show alignment toolbar only
  if (selectedCount > 1) {
    return (
      <div className="w-56 border-l">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                {selectedCount} elements selected
              </span>
            </div>
            <AlignmentToolbar />
          </div>
        </ScrollArea>
      </div>
    );
  }

  // No selection
  if (!element) {
    return (
      <div className="w-56 border-l">
        {currentLayoutId ? (
          <ScrollArea className="h-full">
            <div className="space-y-4 p-3">
              <CanvasSizeSection />
              <p className="text-xs text-muted-foreground">
                Select an element to edit its properties.
              </p>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
            Select an element to edit its properties.
          </div>
        )}
      </div>
    );
  }

  // Single element selected
  return (
    <div className="w-56 border-l">
      <ScrollArea className="h-full">
        <div className="space-y-4 p-3">
          <div>
            <span className="text-xs font-medium capitalize text-muted-foreground">
              {element.type} element
            </span>
          </div>

          <PositionSection element={element} />
          <BindingSection element={element} properties={properties} />

          {element.type === "text" && <TextStyleSection element={element} />}
          {element.type === "image" && <ImageStyleSection element={element} />}
          {element.type === "shape" && <ShapeStyleSection element={element} />}

          <AppearanceSection element={element} />
          <ShadowSection element={element} />
        </div>
      </ScrollArea>
    </div>
  );
}
