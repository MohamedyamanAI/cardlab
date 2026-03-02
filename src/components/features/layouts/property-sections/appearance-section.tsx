import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface AppearanceSectionProps {
  element: CanvasElement;
}

const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
] as const;

export function AppearanceSection({ element }: AppearanceSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase">Appearance</h4>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Opacity</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={element.opacity ?? 1}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0 && v <= 1)
                updateElement(element.id, { opacity: v });
            }}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Blend</Label>
          <Select
            value={element.blend_mode ?? "normal"}
            onValueChange={(val) =>
              updateElement(element.id, {
                blend_mode: val === "normal" ? undefined : val,
              })
            }
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BLEND_MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
