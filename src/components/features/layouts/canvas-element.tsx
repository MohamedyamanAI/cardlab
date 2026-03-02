"use client";

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
  const selectedElementId = useLayoutEditorStore((s) => s.selectedElementId);
  const selectElement = useLayoutEditorStore((s) => s.selectElement);
  const moveElement = useLayoutEditorStore((s) => s.moveElement);
  const resizeElement = useLayoutEditorStore((s) => s.resizeElement);
  const updateElement = useLayoutEditorStore((s) => s.updateElement);

  const isSelected = selectedElementId === element.id;

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
        selectElement(element.id);
      }}
      onDragStop={(_e, d) => {
        moveElement(element.id, d.x, d.y);
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
        selectElement(element.id);
      }}
      style={{ zIndex: element.z_index }}
      className={cn(
        "group/el",
        isSelected && "ring-2 ring-blue-500"
      )}
      enableResizing={isSelected}
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
