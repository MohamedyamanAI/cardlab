"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { TextRenderer } from "@/components/features/layouts/element-renderers/text-renderer";
import { ImageRenderer } from "@/components/features/layouts/element-renderers/image-renderer";
import { ShapeRenderer } from "@/components/features/layouts/element-renderers/shape-renderer";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import { cn } from "@/lib/utils/utils";

interface LayoutThumbnailProps {
  name: string;
  width: number;
  height: number;
  elements: CanvasElement[];
  onClick: () => void;
  isTemplate?: boolean;
  description?: string;
}

export function LayoutThumbnail({
  name,
  width,
  height,
  elements,
  onClick,
  isTemplate,
  description,
}: LayoutThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.15);

  const sorted = useMemo(
    () => [...elements].sort((a, b) => a.z_index - b.z_index),
    [elements]
  );

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const style = getComputedStyle(containerRef.current);
    const padX =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const padY =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const scaleX = (rect.width - padX) / width;
    const scaleY = (rect.height - padY) / height;
    setScale(Math.min(scaleX, scaleY));
  }, [width, height]);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border text-left transition-colors hover:border-foreground/30 hover:bg-muted/50",
        isTemplate ? "border-dashed" : "border-border"
      )}
    >
      {/* Preview area */}
      <div
        ref={containerRef}
        className="relative flex h-40 items-center justify-center overflow-hidden bg-muted/30 p-5"
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
          className="relative shrink-0"
        >
          {sorted.map((el) => (
            <div
              key={el.id}
              className="absolute overflow-hidden"
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                zIndex: el.z_index,
              }}
            >
              {el.type === "text" && (
                <TextRenderer element={el} previewValue={null} />
              )}
              {el.type === "image" && (
                <ImageRenderer element={el} previewValue={null} />
              )}
              {el.type === "shape" && <ShapeRenderer element={el} />}
            </div>
          ))}
        </div>
      </div>

      {/* Info area */}
      <div className="flex flex-col gap-0.5 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{name}</span>
          {isTemplate && (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Template
            </span>
          )}
        </div>
        {description && (
          <span className="truncate text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </div>
    </button>
  );
}
