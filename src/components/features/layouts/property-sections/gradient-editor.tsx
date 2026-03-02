import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ShapeElement, GradientStop } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { IconPlus, IconTrash } from "@tabler/icons-react";

interface GradientEditorProps {
  element: ShapeElement;
}

export function GradientEditor({ element }: GradientEditorProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);
  const gradient = element.gradient;
  if (!gradient) return null;

  const updateGradient = (partial: Partial<typeof gradient>) => {
    updateElement(element.id, { gradient: { ...gradient, ...partial } });
  };

  const updateStop = (index: number, partial: Partial<GradientStop>) => {
    const stops = gradient.stops.map((s, i) =>
      i === index ? { ...s, ...partial } : s
    );
    updateGradient({ stops });
  };

  const addStop = () => {
    const stops = [...gradient.stops];
    // Insert at midpoint of last two stops
    const lastPos = stops.length > 0 ? stops[stops.length - 1].position : 0;
    const newPos = Math.min(lastPos + 20, 100);
    stops.push({ color: "#888888", position: newPos });
    updateGradient({ stops });
  };

  const removeStop = (index: number) => {
    if (gradient.stops.length <= 2) return; // minimum 2 stops
    const stops = gradient.stops.filter((_, i) => i !== index);
    updateGradient({ stops });
  };

  return (
    <div className="space-y-2">
      {gradient.type === "linear" && (
        <div>
          <Label className="text-xs">Angle</Label>
          <Input
            type="number"
            value={gradient.angle ?? 0}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) updateGradient({ angle: v });
            }}
            className="h-7 text-xs"
          />
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Color Stops</Label>
          <button
            onClick={addStop}
            className="text-xs text-muted-foreground hover:text-foreground"
            title="Add stop"
          >
            <IconPlus className="size-3" />
          </button>
        </div>
        {gradient.stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => updateStop(i, { color: e.target.value })}
              className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={stop.position}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 0 && v <= 100) updateStop(i, { position: v });
              }}
              className="h-6 w-14 text-xs"
            />
            <span className="text-xs text-muted-foreground">%</span>
            {gradient.stops.length > 2 && (
              <button
                onClick={() => removeStop(i)}
                className="text-muted-foreground hover:text-destructive"
              >
                <IconTrash className="size-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Gradient preview */}
      <div
        className="h-4 w-full rounded border"
        style={{
          background:
            gradient.type === "radial"
              ? `radial-gradient(circle, ${gradient.stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`
              : `linear-gradient(${gradient.angle ?? 0}deg, ${gradient.stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`,
        }}
      />
    </div>
  );
}
