"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { PositionSection } from "./property-sections/position-section";
import { BindingSection } from "./property-sections/binding-section";
import { TextStyleSection } from "./property-sections/text-style-section";
import { ImageStyleSection } from "./property-sections/image-style-section";
import { ShapeStyleSection } from "./property-sections/shape-style-section";

export function PropertiesPanel() {
  const elements = useLayoutEditorStore((s) => s.elements);
  const selectedElementId = useLayoutEditorStore((s) => s.selectedElementId);
  const properties = useCardsStore((s) => s.properties);

  const element = elements.find((el) => el.id === selectedElementId);

  if (!element) {
    return (
      <div className="flex w-56 items-center justify-center border-l p-4 text-xs text-muted-foreground">
        Select an element to edit its properties.
      </div>
    );
  }

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
        </div>
      </ScrollArea>
    </div>
  );
}
