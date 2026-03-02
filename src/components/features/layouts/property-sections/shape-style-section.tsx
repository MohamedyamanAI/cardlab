import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShapeElement } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { GradientEditor } from "./gradient-editor";

interface ShapeStyleSectionProps {
  element: ShapeElement;
}

export function ShapeStyleSection({ element }: ShapeStyleSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);
  const shapeType = element.shape_type ?? "rectangle";
  const fillType = element.fill_type ?? "solid";

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase">Shape Style</h4>

      <div>
        <Label className="text-xs">Shape Type</Label>
        <Select
          value={shapeType}
          onValueChange={(val) =>
            updateElement(element.id, {
              shape_type: val as "rectangle" | "ellipse" | "line",
            })
          }
        >
          <SelectTrigger className="h-7 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rectangle">Rectangle</SelectItem>
            <SelectItem value="ellipse">Ellipse</SelectItem>
            <SelectItem value="line">Line</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fill — hidden for line */}
      {shapeType !== "line" && (
        <div>
          <Label className="text-xs">Fill Type</Label>
          <Select
            value={fillType}
            onValueChange={(val) => {
              const newFillType = val as "solid" | "linear" | "radial";
              const updates: Partial<ShapeElement> = { fill_type: newFillType };
              // Initialize gradient if switching to gradient mode
              if (newFillType !== "solid" && !element.gradient) {
                updates.gradient = {
                  type: newFillType,
                  angle: 90,
                  stops: [
                    { color: "#000000", position: 0 },
                    { color: "#ffffff", position: 100 },
                  ],
                };
              } else if (element.gradient && newFillType !== "solid") {
                updates.gradient = { ...element.gradient, type: newFillType };
              }
              updateElement(element.id, updates);
            }}
          >
            <SelectTrigger className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="linear">Linear Gradient</SelectItem>
              <SelectItem value="radial">Radial Gradient</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {shapeType !== "line" && fillType === "solid" && (
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
      )}

      {shapeType !== "line" && fillType !== "solid" && element.gradient && (
        <GradientEditor element={element} />
      )}

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
        {/* Radius — only for rectangle */}
        {shapeType === "rectangle" && (
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
        )}
      </div>
    </div>
  );
}
