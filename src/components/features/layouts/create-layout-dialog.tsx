"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { CARD_SIZE_PRESETS } from "./card-size-presets";

const DEFAULT_PRESET = CARD_SIZE_PRESETS[0]; // Poker

interface CreateLayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLayoutDialog({ open, onOpenChange }: CreateLayoutDialogProps) {
  const [name, setName] = useState("");
  const [presetIndex, setPresetIndex] = useState("0");
  const [customWidth, setCustomWidth] = useState<number>(DEFAULT_PRESET.width);
  const [customHeight, setCustomHeight] = useState<number>(DEFAULT_PRESET.height);
  const [isCreating, setIsCreating] = useState(false);
  const createLayout = useLayoutEditorStore((s) => s.createLayout);
  const selectLayout = useLayoutEditorStore((s) => s.selectLayout);
  const selectedProjectId = useCardsStore((s) => s.selectedProjectId);

  const preset = SIZE_PRESETS[Number(presetIndex)];
  const isCustom = preset.label === "Custom";
  const width = isCustom ? customWidth : preset.width;
  const height = isCustom ? customHeight : preset.height;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedProjectId || width < 1 || height < 1) return;

    setIsCreating(true);
    const layout = await createLayout({
      project_id: selectedProjectId,
      name: name.trim(),
      width,
      height,
    });

    if (layout) {
      selectLayout(layout.id);
      setName("");
      setPresetIndex("0");
      setCustomWidth(DEFAULT_PRESET.width);
      setCustomHeight(DEFAULT_PRESET.height);
      onOpenChange(false);
    }
    setIsCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Layout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Card Front, Card Back..."
              autoFocus
            />
          </div>
          <div>
            <Label>Card Size</Label>
            <Select value={presetIndex} onValueChange={setPresetIndex}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_PRESETS.map((p, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isCustom && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Width (px)</Label>
                <Input
                  type="number"
                  min={1}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-xs">Height (px)</Label>
                <Input
                  type="number"
                  min={1}
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                />
              </div>
            </div>
          )}
          {!isCustom && (
            <p className="text-xs text-muted-foreground">
              {width} × {height} px (at 300 DPI)
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isCreating || width < 1 || height < 1}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
