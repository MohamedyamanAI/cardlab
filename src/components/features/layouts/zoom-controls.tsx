"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLayoutEditorStore, type RulerUnit } from "@/lib/store/layout-editor-store";
import { IconMinus, IconPlus, IconFocusCentered, IconRuler2 } from "@tabler/icons-react";

export function ZoomControls() {
  const zoom = useLayoutEditorStore((s) => s.zoom);
  const zoomIn = useLayoutEditorStore((s) => s.zoomIn);
  const zoomOut = useLayoutEditorStore((s) => s.zoomOut);
  const resetView = useLayoutEditorStore((s) => s.resetView);
  const showRulers = useLayoutEditorStore((s) => s.showRulers);
  const setShowRulers = useLayoutEditorStore((s) => s.setShowRulers);
  const rulerUnit = useLayoutEditorStore((s) => s.rulerUnit);
  const setRulerUnit = useLayoutEditorStore((s) => s.setRulerUnit);

  return (
    <div className="absolute right-3 bottom-3 z-10 flex items-center gap-0.5 rounded-lg border bg-background/90 p-0.5 shadow-sm backdrop-blur-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={zoomOut}
        title="Zoom out"
      >
        <IconMinus className="size-3.5" />
      </Button>
      <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={zoomIn}
        title="Zoom in"
      >
        <IconPlus className="size-3.5" />
      </Button>
      <div className="mx-0.5 h-4 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={resetView}
        title="Fit to canvas"
      >
        <IconFocusCentered className="size-3.5" />
      </Button>
      <div className="mx-0.5 h-4 w-px bg-border" />
      <Button
        variant={showRulers ? "secondary" : "ghost"}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => setShowRulers(!showRulers)}
        title={showRulers ? "Hide rulers" : "Show rulers"}
      >
        <IconRuler2 className="size-3.5" />
      </Button>
      {showRulers && (
        <Select value={rulerUnit} onValueChange={(v) => setRulerUnit(v as RulerUnit)}>
          <SelectTrigger className="h-7 w-14 border-0 bg-transparent px-1.5 text-xs shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="px">px</SelectItem>
            <SelectItem value="in">in</SelectItem>
            <SelectItem value="cm">cm</SelectItem>
            <SelectItem value="mm">mm</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
