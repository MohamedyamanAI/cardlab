import { useState, useEffect } from "react";
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
import { MediaPickerDialog } from "@/components/features/cards/preview/media-picker-dialog";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";
import type { ImageElement } from "@/lib/types/canvas-elements";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface ImageStyleSectionProps {
  element: ImageElement;
}

export function ImageStyleSection({ element }: ImageStyleSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);
  const [pickerOpen, setPickerOpen] = useState(false);
  const getSignedUrl = useMediaCacheStore((s) => s.getSignedUrl);
  const resolveMediaIds = useMediaCacheStore((s) => s.resolveMediaIds);

  const staticUrl = element.static_src ? getSignedUrl(element.static_src) : undefined;

  // Resolve the media ID in an effect to avoid setState during render
  useEffect(() => {
    if (element.static_src && !staticUrl) {
      resolveMediaIds([element.static_src]);
    }
  }, [element.static_src, staticUrl, resolveMediaIds]);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase">Image</h4>

      {/* Static image picker */}
      <div>
        <Label className="text-xs">Static Image</Label>
        <div className="mt-1 flex items-center gap-1.5">
          {staticUrl ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border">
              <img src={staticUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border bg-muted/30">
              <IconPhoto className="size-4 text-muted-foreground/50" />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-1">
            <Button
              variant="outline"
              size="xs"
              className="w-full"
              onClick={() => setPickerOpen(true)}
            >
              {element.static_src ? "Change" : "Choose"}
            </Button>
            {element.static_src && (
              <Button
                variant="ghost"
                size="xs"
                className="w-full text-destructive"
                onClick={() => updateElement(element.id, { static_src: undefined })}
              >
                <IconX className="size-3" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        currentMediaId={element.static_src}
        onSelect={(mediaId) => {
          updateElement(element.id, { static_src: mediaId ?? undefined });
        }}
      />

      {/* Object fit */}
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
