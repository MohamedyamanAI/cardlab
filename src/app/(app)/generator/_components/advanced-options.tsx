"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IconSettings, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils/utils";
import {
  IMAGE_MODELS,
  IMAGE_STYLE_PRESETS,
  ASPECT_RATIOS,
} from "@/lib/intelligence/core/providers";
import type { AspectRatio, ImageModel } from "@/lib/intelligence/core/types";

export type AdvancedOptionsProps = {
  model: ImageModel;
  setModel: (v: ImageModel) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (v: AspectRatio) => void;
  numberOfImages: number;
  setNumberOfImages: (v: number) => void;
  seed: number | undefined;
  setSeed: (v: number | undefined) => void;
  stylePreset: string;
  setStylePreset: (v: string) => void;
};

export function AdvancedOptions(props: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
          isOpen && "text-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <IconSettings className="size-4" />
          Advanced Options
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
          <IconChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
              <div className="flex flex-col gap-1.5">
                <Label>Model</Label>
                <Select
                  value={props.model}
                  onValueChange={(v) => props.setModel(v as ImageModel)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                        <span className="ml-1 text-muted-foreground">
                          — {m.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Aspect Ratio</Label>
                <Select
                  value={props.aspectRatio}
                  onValueChange={(v) => props.setAspectRatio(v as AspectRatio)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((ar) => (
                      <SelectItem key={ar.value} value={ar.value}>
                        {ar.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Number of Images</Label>
                <Select
                  value={String(props.numberOfImages)}
                  onValueChange={(v) => props.setNumberOfImages(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "image" : "images"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Seed (optional)</Label>
                <Input
                  type="number"
                  placeholder="Random"
                  value={props.seed ?? ""}
                  onChange={(e) =>
                    props.setSeed(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Style Preset</Label>
                <div className="flex flex-wrap gap-2">
                  {IMAGE_STYLE_PRESETS.map((preset) => (
                    <Badge
                      key={preset.id}
                      variant={
                        props.stylePreset === preset.id ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => props.setStylePreset(preset.id)}
                    >
                      {preset.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
