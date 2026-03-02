"use client";

import { useRef } from "react";
import { Rnd } from "react-rnd";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Card, Property } from "@/lib/types";
import type { Json } from "@/lib/supabase/database.types";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { TextRenderer } from "./element-renderers/text-renderer";
import { ImageRenderer } from "./element-renderers/image-renderer";
import { ShapeRenderer } from "./element-renderers/shape-renderer";
import { cn } from "@/lib/utils/utils";

interface CanvasElementProps {
  element: CanvasElement;
  scale: number;
  previewCard?: Card | null;
  properties: Property[];
}

export function CanvasElementWrapper({
  element,
  scale,
  previewCard,
}: CanvasElementProps) {
  const selectedElementIds = useLayoutEditorStore((s) => s.selectedElementIds);
  const selectElement = useLayoutEditorStore((s) => s.selectElement);
  const moveElement = useLayoutEditorStore((s) => s.moveElement);
  const moveSelectedElements = useLayoutEditorStore((s) => s.moveSelectedElements);
  const resizeElement = useLayoutEditorStore((s) => s.resizeElement);
  const updateElement = useLayoutEditorStore((s) => s.updateElement);

  const isSelected = selectedElementIds.has(element.id);
  const multiSelected = selectedElementIds.size > 1;
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Resolve preview value if we have a card and a binding
  let previewValue: string | null = null;
  if (previewCard && element.bind_to) {
    const data =
      typeof previewCard.data === "object" && previewCard.data !== null
        ? (previewCard.data as Record<string, Json>)
        : {};
    const val = data[element.bind_to];
    if (val != null) previewValue = String(val);
  }

  return (
    <Rnd
      position={{ x: element.x, y: element.y }}
      size={{ width: element.width, height: element.height }}
      scale={scale}
      bounds="parent"
      onDragStart={(e) => {
        e.stopPropagation();
        const me = e as MouseEvent;
        // If not already selected, select (potentially additive)
        if (!isSelected) {
          selectElement(element.id, me.shiftKey);
        }
        dragStartRef.current = { x: element.x, y: element.y };
      }}
      onDragStop={(_e, d) => {
        if (isSelected && multiSelected && dragStartRef.current) {
          const dx = d.x - dragStartRef.current.x;
          const dy = d.y - dragStartRef.current.y;
          if (dx !== 0 || dy !== 0) {
            moveSelectedElements(dx, dy);
          }
        } else {
          moveElement(element.id, d.x, d.y);
        }
        dragStartRef.current = null;
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        resizeElement(
          element.id,
          parseInt(ref.style.width, 10),
          parseInt(ref.style.height, 10)
        );
        updateElement(element.id, { x: pos.x, y: pos.y });
      }}
      onMouseDown={(e: MouseEvent) => {
        e.stopPropagation();
        if (!isSelected) {
          selectElement(element.id, e.shiftKey);
        } else if (e.shiftKey) {
          // Shift+click on already-selected → deselect
          selectElement(element.id, true);
        }
      }}
      style={{ zIndex: element.z_index }}
      className={cn(
        "group/el",
        isSelected && "ring-2 ring-blue-500"
      )}
      enableResizing={isSelected && !multiSelected}
      resizeHandleStyles={{
        topLeft: { cursor: "nwse-resize" },
        topRight: { cursor: "nesw-resize" },
        bottomLeft: { cursor: "nesw-resize" },
        bottomRight: { cursor: "nwse-resize" },
      }}
    >
      <div className="h-full w-full overflow-hidden">
        {element.type === "text" && (
          <TextRenderer element={element} previewValue={previewValue} />
        )}
        {element.type === "image" && (
          <ImageRenderer element={element} previewValue={previewValue} />
        )}
        {element.type === "shape" && <ShapeRenderer element={element} />}
      </div>
    </Rnd>
  );
}
