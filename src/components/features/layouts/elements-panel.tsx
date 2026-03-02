"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import {
  createTextElement,
  createImageElement,
  createShapeElement,
} from "@/lib/utils/canvas-element-factory";
import {
  IconTypography,
  IconPhoto,
  IconSquare,
  IconArrowUp,
  IconArrowDown,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils/utils";

export function ElementsPanel() {
  const elements = useLayoutEditorStore((s) => s.elements);
  const selectedElementIds = useLayoutEditorStore((s) => s.selectedElementIds);
  const addElement = useLayoutEditorStore((s) => s.addElement);
  const selectElement = useLayoutEditorStore((s) => s.selectElement);
  const deleteElement = useLayoutEditorStore((s) => s.deleteElement);
  const reorderElement = useLayoutEditorStore((s) => s.reorderElement);

  const sorted = [...elements].sort((a, b) => b.z_index - a.z_index);

  return (
    <div className="flex h-full w-52 flex-col border-r">
      <div className="border-b p-3">
        <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
          Add Element
        </h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => addElement(createTextElement())}
          >
            <IconTypography className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => addElement(createImageElement())}
          >
            <IconPhoto className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => addElement(createShapeElement())}
          >
            <IconSquare className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <h3 className="p-3 pb-1 text-xs font-medium text-muted-foreground uppercase">
          Layers
        </h3>
        <ScrollArea className="h-full px-2 pb-2">
          <div className="space-y-0.5">
            {sorted.map((el) => (
              <div
                key={el.id}
                className={cn(
                  "group flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors",
                  selectedElementIds.has(el.id)
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={(e) => selectElement(el.id, e.shiftKey)}
              >
                {el.type === "text" && <IconTypography className="size-3.5 shrink-0" />}
                {el.type === "image" && <IconPhoto className="size-3.5 shrink-0" />}
                {el.type === "shape" && <IconSquare className="size-3.5 shrink-0" />}
                <span className="flex-1 truncate">
                  {el.bind_to
                    ? `{${el.bind_to}}`
                    : el.type === "text" && "static_text" in el && el.static_text
                      ? el.static_text
                      : el.type}
                </span>
                <div className="hidden gap-0.5 group-hover:flex">
                  <button
                    onClick={(e) => { e.stopPropagation(); reorderElement(el.id, "up"); }}
                    className="rounded p-0.5 hover:bg-background"
                  >
                    <IconArrowUp className="size-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); reorderElement(el.id, "down"); }}
                    className="rounded p-0.5 hover:bg-background"
                  >
                    <IconArrowDown className="size-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                    className="rounded p-0.5 text-destructive hover:bg-background"
                  >
                    <IconTrash className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
