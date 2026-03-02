import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ImageElement } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface ImageStyleSectionProps {
  element: ImageElement;
}

export function ImageStyleSection({ element }: ImageStyleSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase">Image Style</h4>

      <div>
        <Label className="text-xs">Object Fit</Label>
        <Select
          value={element.object_fit}
          onValueChange={(val) =>
            updateElement(element.id, {
              object_fit: val as "cover" | "contain" | "fill",
            })
          }
        >
          <SelectTrigger className="h-7 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Border Radius</Label>
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
  );
}
