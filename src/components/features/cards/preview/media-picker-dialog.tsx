"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconUpload,
  IconLoader2,
  IconCheck,
  IconX,
  IconPhoto,
} from "@tabler/icons-react";
import {
  getMedia,
  getSignedUrls,
  uploadMedia,
} from "@/lib/actions/media";
import { useMediaCacheStore } from "@/lib/store/media-cache-store";
import type { Media } from "@/lib/types";

type MediaItem = Media & { signedUrl: string };

type UploadItem = {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mediaId: string | null) => void;
  currentMediaId?: string | null;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  currentMediaId,
}: MediaPickerDialogProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const urlCache = useRef<Record<string, string>>({});
  const invalidate = useMediaCacheStore((s) => s.invalidate);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const result = await getMedia();
    if (result.success) {
      const mediaList = result.data.filter((m) => m.type === "image");
      const uncached = mediaList
        .map((m) => m.storage_path)
        .filter((p) => !urlCache.current[p]);

      if (uncached.length > 0) {
        const urlResult = await getSignedUrls(uncached);
        if (urlResult.success) {
          Object.assign(urlCache.current, urlResult.data);
        }
      }

      setItems(
        mediaList
          .filter((m) => urlCache.current[m.storage_path])
          .map((m) => ({
            ...m,
            signedUrl: urlCache.current[m.storage_path],
          }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open, fetchItems]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const uploadItems: UploadItem[] = acceptedFiles.map((file) => ({
        file,
        status: "pending" as const,
      }));
      setUploads(uploadItems);
      setIsUploading(true);

      const results = [...uploadItems];

      await Promise.all(
        results.map(async (item, index) => {
          results[index] = { ...item, status: "uploading" };
          setUploads([...results]);

          const formData = new FormData();
          formData.append("file", item.file);
          const result = await uploadMedia(formData);

          if (result.success) {
            results[index] = { ...item, status: "done" };
            // Invalidate cache for any existing entry that might have the same ID
            invalidate([result.data.id]);
          } else {
            results[index] = {
              ...item,
              status: "error",
              error: result.error,
            };
          }
          setUploads([...results]);
        })
      );

      setIsUploading(false);

      // Refresh gallery after upload
      setTimeout(() => {
        setUploads([]);
        fetchItems();
      }, 800);
    },
    [fetchItems, invalidate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: isUploading,
  });

  const handleSelect = useCallback(
    (mediaId: string) => {
      onSelect(mediaId);
      onOpenChange(false);
    },
    [onSelect, onOpenChange]
  );

  const handleClear = useCallback(() => {
    onSelect(null);
    onOpenChange(false);
  }, [onSelect, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Image</DialogTitle>
        </DialogHeader>

        {/* Upload zone */}
        {uploads.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <span className="text-xs font-medium text-muted-foreground">
              Uploading {uploads.length} file{uploads.length > 1 ? "s" : ""}
            </span>
            <div className="space-y-1">
              {uploads.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {item.status === "uploading" && (
                    <IconLoader2 className="size-3.5 animate-spin text-muted-foreground" />
                  )}
                  {item.status === "done" && (
                    <IconCheck className="size-3.5 text-green-500" />
                  )}
                  {item.status === "error" && (
                    <IconX className="size-3.5 text-destructive" />
                  )}
                  {item.status === "pending" && <div className="size-3.5" />}
                  <span className="truncate">{item.file.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <IconUpload className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isDragActive
                ? "Drop files here"
                : "Drop images or click to upload"}
            </span>
          </div>
        )}

        {/* Gallery grid */}
        <ScrollArea className="h-[320px]">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <IconLoader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <IconPhoto className="size-8" />
              <span className="text-sm">No images yet</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 p-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    currentMediaId === item.id
                      ? "border-primary"
                      : "border-transparent hover:border-primary/50"
                  }`}
                >
                  <img
                    src={item.signedUrl}
                    alt={item.original_name ?? ""}
                    className="size-full object-cover"
                  />
                  {currentMediaId === item.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <IconCheck className="size-6 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="block truncate text-[10px] text-white">
                      {item.original_name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-between">
          {currentMediaId ? (
            <Button variant="outline" size="sm" onClick={handleClear}>
              Remove Image
            </Button>
          ) : (
            <div />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
