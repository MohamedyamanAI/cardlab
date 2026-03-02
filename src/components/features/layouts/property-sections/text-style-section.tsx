import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TextElement } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface TextStyleSectionProps {
  element: TextElement;
}

export function TextStyleSection({ element }: TextStyleSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase">Text Style</h4>

      <div>
        <Label className="text-xs">Static Text</Label>
        <Input
          value={element.static_text ?? ""}
          onChange={(e) =>
            updateElement(element.id, { static_text: e.target.value || undefined })
          }
          placeholder="Override text..."
          className="h-7 text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Font Size</Label>
          <Input
            type="number"
            value={element.font_size}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) updateElement(element.id, { font_size: v });
            }}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Weight</Label>
          <Select
            value={element.font_weight}
            onValueChange={(val) =>
              updateElement(element.id, { font_weight: val as "normal" | "bold" })
            }
          >
            <SelectTrigger className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Align</Label>
          <Select
            value={element.text_align}
            onValueChange={(val) =>
              updateElement(element.id, {
                text_align: val as "left" | "center" | "right",
              })
            }
          >
            <SelectTrigger className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Vertical</Label>
          <Select
            value={element.vertical_align}
            onValueChange={(val) =>
              updateElement(element.id, {
                vertical_align: val as "top" | "middle" | "bottom",
              })
            }
          >
            <SelectTrigger className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="middle">Middle</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Color</Label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={element.color}
              onChange={(e) => updateElement(element.id, { color: e.target.value })}
              className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <Input
              value={element.color}
              onChange={(e) => updateElement(element.id, { color: e.target.value })}
              className="h-7 flex-1 text-xs"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Overflow</Label>
          <Select
            value={element.overflow}
            onValueChange={(val) =>
              updateElement(element.id, {
                overflow: val as "wrap" | "truncate" | "visible",
              })
            }
          >
            <SelectTrigger className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wrap">Wrap</SelectItem>
              <SelectItem value="truncate">Truncate</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
