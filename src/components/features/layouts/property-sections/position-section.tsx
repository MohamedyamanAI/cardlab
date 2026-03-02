import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface PositionSectionProps {
  element: CanvasElement;
}

export function PositionSection({ element }: PositionSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);

  const handleChange = (field: "x" | "y" | "width" | "height", value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      updateElement(element.id, { [field]: num });
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase">Position & Size</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">X</Label>
          <Input
            type="number"
            value={element.x}
            onChange={(e) => handleChange("x", e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Y</Label>
          <Input
            type="number"
            value={element.y}
            onChange={(e) => handleChange("y", e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">W</Label>
          <Input
            type="number"
            value={element.width}
            onChange={(e) => handleChange("width", e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">H</Label>
          <Input
            type="number"
            value={element.height}
            onChange={(e) => handleChange("height", e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">Rotation</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={element.rotation ?? 0}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v)) updateElement(element.id, { rotation: v });
              }}
              className="h-7 flex-1 text-xs"
            />
            <span className="text-xs text-muted-foreground">deg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
