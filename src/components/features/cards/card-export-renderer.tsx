"use client";

import { forwardRef, useMemo } from "react";
import { TextRenderer } from "@/components/features/layouts/element-renderers/text-renderer";
import { ShapeRenderer } from "@/components/features/layouts/element-renderers/shape-renderer";
import type { CanvasElement, ImageElement } from "@/lib/types/canvas-elements";
import type { Json } from "@/lib/supabase/database.types";
import { IconPhoto } from "@tabler/icons-react";

interface CardExportRendererProps {
  elements: CanvasElement[];
  cardData: Record<string, Json>;
  mediaUrls: Record<string, string>;
  width: number;
  height: number;
}

export const CardExportRenderer = forwardRef<
  HTMLDivElement,
  CardExportRendererProps
>(function CardExportRenderer({ elements, cardData, mediaUrls, width, height }, ref) {
  const sorted = useMemo(
    () => [...elements].sort((a, b) => a.z_index - b.z_index),
    [elements]
  );

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        position: "relative",
        background: "#262626",
        overflow: "hidden",
      }}
    >
      {sorted.map((el) => {
        let previewValue: string | null = null;
        if (el.bind_to) {
          const val = cardData[el.bind_to];
          if (val != null) previewValue = String(val);
        }

        return (
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
              <TextRenderer element={el} previewValue={previewValue} />
            )}
            {el.type === "image" && (
              <ExportImageRenderer
                element={el}
                previewValue={previewValue}
                mediaUrls={mediaUrls}
              />
            )}
            {el.type === "shape" && <ShapeRenderer element={el} />}
          </div>
        );
      })}
    </div>
  );
});

function ExportImageRenderer({
  element,
  previewValue,
  mediaUrls,
}: {
  element: ImageElement;
  previewValue?: string | null;
  mediaUrls: Record<string, string>;
}) {
  const mediaId = previewValue ?? element.static_src;
  const signedUrl = mediaId ? mediaUrls[mediaId] : undefined;

  if (signedUrl) {
    return (
      <img
        src={signedUrl}
        alt=""
        className="pointer-events-none h-full w-full select-none"
        crossOrigin="anonymous"
        style={{
          objectFit: element.object_fit,
          borderRadius: element.border_radius ?? 0,
        }}
        draggable={false}
      />
    );
  }

  return (
    <div
      className="pointer-events-none flex h-full w-full select-none items-center justify-center bg-muted/30"
      style={{ borderRadius: element.border_radius ?? 0 }}
    >
      <IconPhoto className="size-8 text-muted-foreground/50" />
    </div>
  );
}
