import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { CARD_SIZE_PRESETS, findPresetIndex } from "../card-size-presets";

export function CanvasSizeSection() {
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);
  const updateLayoutDimensions = useLayoutEditorStore(
    (s) => s.updateLayoutDimensions
  );

  const layout = layouts.find((l) => l.id === currentLayoutId);
  const layoutWidth = layout?.width ?? 750;
  const layoutHeight = layout?.height ?? 1050;

  const [presetIndex, setPresetIndex] = useState(() =>
    String(findPresetIndex(layoutWidth, layoutHeight))
  );
  const [customWidth, setCustomWidth] = useState(layoutWidth);
  const [customHeight, setCustomHeight] = useState(layoutHeight);

  // Sync local state when layout changes
  useEffect(() => {
    const idx = findPresetIndex(layoutWidth, layoutHeight);
    setPresetIndex(String(idx));
    setCustomWidth(layoutWidth);
    setCustomHeight(layoutHeight);
  }, [currentLayoutId, layoutWidth, layoutHeight]);

  const preset = CARD_SIZE_PRESETS[Number(presetIndex)];
  const isCustom = preset.label === "Custom";

  const handlePresetChange = (value: string) => {
    setPresetIndex(value);
    const p = CARD_SIZE_PRESETS[Number(value)];
    if (p.label !== "Custom" && currentLayoutId) {
      updateLayoutDimensions(currentLayoutId, p.width, p.height);
    }
  };

  const handleCustomChange = (field: "width" | "height", raw: string) => {
    const num = parseInt(raw, 10);
    if (isNaN(num) || num < 1) return;
    const newW = field === "width" ? num : customWidth;
    const newH = field === "height" ? num : customHeight;
    if (field === "width") setCustomWidth(num);
    else setCustomHeight(num);
    if (currentLayoutId) {
      updateLayoutDimensions(currentLayoutId, newW, newH);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium uppercase text-muted-foreground">
        Card Size
      </h4>
      <Select value={presetIndex} onValueChange={handlePresetChange}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CARD_SIZE_PRESETS.map((p, i) => (
            <SelectItem key={i} value={String(i)}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isCustom ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">W</Label>
            <Input
              type="number"
              min={1}
              value={customWidth}
              onChange={(e) => handleCustomChange("width", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">H</Label>
            <Input
              type="number"
              min={1}
              value={customHeight}
              onChange={(e) => handleCustomChange("height", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {layoutWidth} × {layoutHeight} px
        </p>
      )}
    </div>
  );
}
