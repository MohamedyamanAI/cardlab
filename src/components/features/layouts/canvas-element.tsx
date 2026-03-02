"use client";

import { useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Card, Property } from "@/lib/types";
import type { Json } from "@/lib/supabase/database.types";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { TextRenderer } from "./element-renderers/text-renderer";
import { ImageRenderer } from "./element-renderers/image-renderer";
import { ShapeRenderer } from "./element-renderers/shape-renderer";
import { InlineRichTextEditor } from "./inline-rich-text-editor";
import { cn } from "@/lib/utils/utils";

interface CanvasElementProps {
  element: CanvasElement;
  scale: number;
  previewCard?: Card | null;
  properties: Property[];
}

function boxShadowCSS(el: CanvasElement): string | undefined {
  const s = el.box_shadow;
  if (!s) return undefined;
  return `${s.offset_x}px ${s.offset_y}px ${s.blur}px ${s.spread}px ${s.color}`;
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
  const editingElementId = useLayoutEditorStore((s) => s.editingElementId);
  const setEditingElement = useLayoutEditorStore((s) => s.setEditingElement);

  const isSelected = selectedElementIds.has(element.id);
  const multiSelected = selectedElementIds.size > 1;
  const isLocked = element.locked ?? false;
  const isHidden = element.hidden ?? false;
  const isEditing = editingElementId === element.id;
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const rotateStartRef = useRef<{ startAngle: number; startRotation: number } | null>(null);

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

  const handleRotateStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;

      // Get canvas-space coords from the event
      const rndEl = (e.target as HTMLElement).closest("[class*='group/el']");
      const canvas = rndEl?.parentElement;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const mouseCanvasX = (e.clientX - canvasRect.left) / scale;
      const mouseCanvasY = (e.clientY - canvasRect.top) / scale;

      const startAngle = Math.atan2(mouseCanvasY - centerY, mouseCanvasX - centerX);
      rotateStartRef.current = {
        startAngle,
        startRotation: element.rotation ?? 0,
      };

      const handleMouseMove = (me: MouseEvent) => {
        if (!rotateStartRef.current) return;
        const mx = (me.clientX - canvasRect.left) / scale;
        const my = (me.clientY - canvasRect.top) / scale;
        const currentAngle = Math.atan2(my - centerY, mx - centerX);
        const delta = (currentAngle - rotateStartRef.current.startAngle) * (180 / Math.PI);
        let newRotation = rotateStartRef.current.startRotation + delta;
        // Snap to 15° increments when shift is held
        if (me.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        updateElement(element.id, { rotation: Math.round(newRotation * 10) / 10 });
      };

      const handleMouseUp = () => {
        rotateStartRef.current = null;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [element, scale, updateElement]
  );

  if (isHidden) return null;

  const rotation = element.rotation ?? 0;
  const opacity = element.opacity ?? 1;

  return (
    <Rnd
      position={{ x: element.x, y: element.y }}
      size={{ width: element.width, height: element.height }}
      scale={scale}
      bounds="parent"
      disableDragging={isLocked || isEditing}
      onDragStart={(e) => {
        if (isLocked) return;
        e.stopPropagation();
        const me = e as MouseEvent;
        if (!isSelected) {
          selectElement(element.id, me.shiftKey);
        }
        dragStartRef.current = { x: element.x, y: element.y };
      }}
      onDragStop={(_e, d) => {
        if (isLocked) return;
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
        if (isLocked) return;
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
          selectElement(element.id, true);
        }
      }}
      style={{ zIndex: element.z_index }}
      className={cn(
        "group/el",
        isSelected && (isLocked ? "ring-2 ring-gray-400" : "ring-2 ring-blue-500")
      )}
      enableResizing={isSelected && !multiSelected && !isLocked && !isEditing}
      resizeHandleStyles={{
        topLeft: { cursor: "nwse-resize" },
        topRight: { cursor: "nesw-resize" },
        bottomLeft: { cursor: "nesw-resize" },
        bottomRight: { cursor: "nwse-resize" },
      }}
    >
      {/* Rotation handle */}
      {isSelected && !multiSelected && !isLocked && (
        <div
          className="absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
          style={{ top: -28 }}
          onMouseDown={handleRotateStart}
        >
          <div className="flex flex-col items-center">
            <div className="h-3 w-px bg-blue-500" />
            <div className="size-3 rounded-full border-2 border-blue-500 bg-background" />
          </div>
        </div>
      )}

      <div
        className="h-full w-full overflow-hidden"
        style={{
          opacity,
          mixBlendMode: (element.blend_mode ?? "normal") as React.CSSProperties["mixBlendMode"],
          boxShadow: boxShadowCSS(element),
          transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
        }}
        onDoubleClick={(e) => {
          if (element.type === "text" && !isLocked) {
            e.stopPropagation();
            setEditingElement(element.id);
          }
        }}
      >
        {element.type === "text" && !isEditing && (
          <TextRenderer element={element} previewValue={previewValue} />
        )}
        {element.type === "text" && isEditing && (
          <InlineRichTextEditor element={element} />
        )}
        {element.type === "image" && (
          <ImageRenderer element={element} previewValue={previewValue} />
        )}
        {element.type === "shape" && <ShapeRenderer element={element} />}
      </div>
    </Rnd>
  );
}
