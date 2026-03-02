"use client";

import { useEffect, useState } from "react";
import { IconPhoto, IconX, IconReplace } from "@tabler/icons-react";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";
import { MediaPickerDialog } from "../../preview/media-picker-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ImageCellProps {
  value: unknown;
  isEditing: boolean;
  onStartEdit: () => void;
  onCommit: (value: string | null) => void;
  onCancel: () => void;
}

export function ImageCell({
  value,
  isEditing,
  onStartEdit,
  onCommit,
  onCancel,
}: ImageCellProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const rawValue = typeof value === "string" ? value : "";
  const isMediaId = UUID_REGEX.test(rawValue);
  const isLegacyUrl = rawValue.startsWith("http");

  const signedUrl = useMediaCacheStore((s) =>
    isMediaId ? s.getSignedUrl(rawValue) : undefined
  );
  const entry = useMediaCacheStore((s) =>
    isMediaId ? s.getEntry(rawValue) : undefined
  );
  const isPending = useMediaCacheStore((s) =>
    isMediaId && !signedUrl ? s.pending.has(rawValue) : false
  );

  const displayUrl = isMediaId ? signedUrl : isLegacyUrl ? rawValue : undefined;
  const displayName = isMediaId
    ? entry?.originalName ?? "Image"
    : isLegacyUrl
      ? rawValue
      : undefined;

  // Open picker when entering edit mode
  useEffect(() => {
    if (isEditing && !pickerOpen) {
      setPickerOpen(true);
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (mediaId: string | null) => {
    onCommit(mediaId);
    setPickerOpen(false);
  };

  const handlePickerClose = (open: boolean) => {
    if (!open) {
      setPickerOpen(false);
      onCancel();
    }
  };

  const handleThumbnailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewOpen(true);
  };

  return (
    <>
      <div
        className="group flex min-h-[28px] w-full cursor-pointer items-center gap-1.5 px-2 py-0.5"
        onDoubleClick={onStartEdit}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt=""
              className="size-5 shrink-0 rounded object-cover"
              onClick={handleThumbnailClick}
            />
            <button
              type="button"
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onCommit(null);
              }}
            >
              <IconX
                size={12}
                className="text-muted-foreground hover:text-foreground"
              />
            </button>
          </>
        ) : isMediaId && (isPending || !signedUrl) ? (
          <div className="size-5 animate-pulse rounded bg-muted" />
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconPhoto size={14} />
          </span>
        )}
      </div>

      {/* Image preview dialog */}
      {displayUrl && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="truncate text-sm">
                {displayName}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center rounded-lg bg-muted/30 p-4">
              <img
                src={displayUrl}
                alt={displayName ?? ""}
                className="max-h-[60vh] rounded object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{entry?.storagePath?.split("/").pop() ?? rawValue}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPreviewOpen(false);
                    onStartEdit();
                  }}
                >
                  <IconReplace size={14} className="mr-1.5" />
                  Replace
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setPreviewOpen(false);
                    onCommit(null);
                  }}
                >
                  <IconX size={14} className="mr-1.5" />
                  Remove
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={handlePickerClose}
        onSelect={handleSelect}
        currentMediaId={isMediaId ? rawValue : null}
      />
    </>
  );
}
