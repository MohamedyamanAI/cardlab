import { IconPhoto } from "@tabler/icons-react";
import type { ImageElement } from "@/lib/types/canvas-elements";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";

interface ImageRendererProps {
  element: ImageElement;
  previewValue?: string | null;
}

export function ImageRenderer({ element, previewValue }: ImageRendererProps) {
  const getSignedUrl = useMediaCacheStore((s) => s.getSignedUrl);

  // Resolve media ID from preview data or static_src
  const mediaId = previewValue ?? element.static_src;
  const isPublicPath = mediaId?.startsWith("/");
  const signedUrl = mediaId && !isPublicPath ? getSignedUrl(mediaId) : undefined;
  const src = isPublicPath ? mediaId : signedUrl;

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="pointer-events-none h-full w-full select-none"
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
