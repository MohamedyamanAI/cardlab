import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { CanvasElement, BoxShadow } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface ShadowSectionProps {
  element: CanvasElement;
}

const DEFAULT_SHADOW: BoxShadow = {
  color: "rgba(0,0,0,0.5)",
  offset_x: 2,
  offset_y: 2,
  blur: 8,
  spread: 0,
};

export function ShadowSection({ element }: ShadowSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);
  const shadow = element.box_shadow;

  if (!shadow) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase">Shadow</h4>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full text-xs"
          onClick={() => updateElement(element.id, { box_shadow: DEFAULT_SHADOW })}
        >
          Add shadow
        </Button>
      </div>
    );
  }

  const update = (partial: Partial<BoxShadow>) => {
    updateElement(element.id, { box_shadow: { ...shadow, ...partial } });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase">Shadow</h4>
        <button
          onClick={() => updateElement(element.id, { box_shadow: undefined })}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Remove
        </button>
      </div>

      <div>
        <Label className="text-xs">Color</Label>
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={shadow.color.startsWith("rgba") ? "#000000" : shadow.color}
            onChange={(e) => update({ color: e.target.value })}
            className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <Input
            value={shadow.color}
            onChange={(e) => update({ color: e.target.value })}
            className="h-7 flex-1 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">X Offset</Label>
          <Input
            type="number"
            value={shadow.offset_x}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) update({ offset_x: v });
            }}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Y Offset</Label>
          <Input
            type="number"
            value={shadow.offset_y}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) update({ offset_y: v });
            }}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Blur</Label>
          <Input
            type="number"
            min={0}
            value={shadow.blur}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 0) update({ blur: v });
            }}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Spread</Label>
          <Input
            type="number"
            value={shadow.spread}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) update({ spread: v });
            }}
            className="h-7 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
