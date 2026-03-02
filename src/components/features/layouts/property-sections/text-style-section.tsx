import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TextElement, TextShadow } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface TextStyleSectionProps {
  element: TextElement;
}

const FONT_FAMILIES = [
  { value: "inherit", label: "Default" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "'Courier New', monospace", label: "Courier New" },
] as const;

const DEFAULT_TEXT_SHADOW: TextShadow = {
  color: "rgba(0,0,0,0.5)",
  offset_x: 1,
  offset_y: 1,
  blur: 3,
};

export function TextStyleSection({ element }: TextStyleSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);
  const textShadow = element.text_shadow;

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

      {element.rich_text && (
        <p className="text-xs text-muted-foreground italic">
          Rich text active — double-click element to edit.
        </p>
      )}

      <div>
        <Label className="text-xs">Font Family</Label>
        <Select
          value={element.font_family || "inherit"}
          onValueChange={(val) =>
            updateElement(element.id, {
              font_family: val === "inherit" ? undefined : val,
            })
          }
        >
          <SelectTrigger className="h-7 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <Label className="text-xs">Line Height</Label>
          <Input
            type="number"
            step={0.1}
            min={0.5}
            value={element.line_height ?? 1.2}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0.5)
                updateElement(element.id, { line_height: v });
            }}
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Letter Sp.</Label>
          <Input
            type="number"
            step={0.5}
            value={element.letter_spacing ?? 0}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v))
                updateElement(element.id, { letter_spacing: v });
            }}
            className="h-7 text-xs"
          />
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

      {/* Text Shadow */}
      <div className="space-y-2">
        {!textShadow ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-full text-xs"
            onClick={() => updateElement(element.id, { text_shadow: DEFAULT_TEXT_SHADOW })}
          >
            Add text shadow
          </Button>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Text Shadow</span>
              <button
                onClick={() => updateElement(element.id, { text_shadow: undefined })}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={textShadow.color.startsWith("rgba") ? "#000000" : textShadow.color}
                onChange={(e) =>
                  updateElement(element.id, { text_shadow: { ...textShadow, color: e.target.value } })
                }
                className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <Input
                value={textShadow.color}
                onChange={(e) =>
                  updateElement(element.id, { text_shadow: { ...textShadow, color: e.target.value } })
                }
                className="h-7 flex-1 text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={textShadow.offset_x}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v))
                      updateElement(element.id, { text_shadow: { ...textShadow, offset_x: v } });
                  }}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={textShadow.offset_y}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v))
                      updateElement(element.id, { text_shadow: { ...textShadow, offset_y: v } });
                  }}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Blur</Label>
                <Input
                  type="number"
                  min={0}
                  value={textShadow.blur}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 0)
                      updateElement(element.id, { text_shadow: { ...textShadow, blur: v } });
                  }}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
