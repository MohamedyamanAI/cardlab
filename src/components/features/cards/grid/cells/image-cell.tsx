"use client";

import { useEffect, useState } from "react";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";
import { MediaPickerDialog } from "../../preview/media-picker-dialog";

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
            />
            <span className="flex-1 truncate text-xs text-muted-foreground">
              {displayName}
            </span>
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
          <div className="flex items-center gap-1.5">
            <div className="size-5 animate-pulse rounded bg-muted" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconPhoto size={14} />
            Add image
          </span>
        )}
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={handlePickerClose}
        onSelect={handleSelect}
        currentMediaId={isMediaId ? rawValue : null}
      />
    </>
  );
}
