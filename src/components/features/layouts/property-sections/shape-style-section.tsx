import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShapeElement } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface ShapeStyleSectionProps {
  element: ShapeElement;
}

export function ShapeStyleSection({ element }: ShapeStyleSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase">Shape Style</h4>

      <div>
        <Label className="text-xs">Fill</Label>
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={element.fill ?? "#ffffff"}
            onChange={(e) => updateElement(element.id, { fill: e.target.value })}
            className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <Input
            value={element.fill ?? ""}
            onChange={(e) =>
              updateElement(element.id, { fill: e.target.value || undefined })
            }
            placeholder="transparent"
            className="h-7 flex-1 text-xs"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Stroke</Label>
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={element.stroke ?? "#ffffff"}
            onChange={(e) => updateElement(element.id, { stroke: e.target.value })}
            className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <Input
            value={element.stroke ?? ""}
            onChange={(e) =>
              updateElement(element.id, { stroke: e.target.value || undefined })
            }
            placeholder="none"
            className="h-7 flex-1 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Stroke Width</Label>
          <Input
            type="number"
            value={element.stroke_width ?? 1}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 0)
                updateElement(element.id, { stroke_width: v });
            }}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Radius</Label>
          <Input
            type="number"
            value={element.border_radius ?? 0}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 0)
                updateElement(element.id, { border_radius: v });
            }}
            className="h-7 text-xs"
          />
        </div>
      </div>

    </div>
  );
}
