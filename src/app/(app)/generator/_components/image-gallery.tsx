"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoaderThree } from "@/components/aceternity/loader";
import {
  IconTrash,
  IconDownload,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import { ImageCard } from "./image-card";
import { UploadZone } from "./upload-zone";
import { getMedia, getSignedUrls, deleteMedia } from "@/lib/actions/media";
import type { GeneratedImage } from "@/lib/intelligence/features/image-generation";
import type { Media } from "@/lib/types";

type GalleryMode = "session" | "library";

type LibraryItem = Media & { signedUrl: string };

type ImageGalleryProps = {
  images: GeneratedImage[];
  isGenerating: boolean;
  onClearHistory: () => void;
  libraryRefreshKey: number;
};

export function ImageGallery({
  images,
  isGenerating,
  onClearHistory,
  libraryRefreshKey,
}: ImageGalleryProps) {
  const [galleryMode, setGalleryMode] = useState<GalleryMode>("session");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Library state
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const urlCache = useRef<Record<string, string>>({});

  const activeItems =
    galleryMode === "session"
      ? images
      : libraryItems;

  const activeCount = activeItems.length;

  const expandedImage =
    expandedIndex !== null
      ? galleryMode === "session"
        ? images[expandedIndex]
        : null
      : null;
  const expandedLibraryItem =
    expandedIndex !== null && galleryMode === "library"
      ? libraryItems[expandedIndex]
      : null;

  const expandedSrc =
    expandedImage
      ? `data:image/png;base64,${expandedImage.base64}`
      : expandedLibraryItem?.signedUrl ?? null;

  const expandedAlt =
    expandedImage?.prompt ??
    expandedLibraryItem?.original_name ??
    "Image";

  // Fetch library
  const fetchLibrary = useCallback(async () => {
    setLibraryLoading(true);
    const result = await getMedia();
    if (result.success) {
      const mediaItems = result.data;
      // Get signed URLs, using cache where possible
      const uncachedPaths = mediaItems
        .map((m) => m.storage_path)
        .filter((p) => !urlCache.current[p]);

      if (uncachedPaths.length > 0) {
        const urlResult = await getSignedUrls(uncachedPaths);
        if (urlResult.success) {
          Object.assign(urlCache.current, urlResult.data);
        }
      }

      const items: LibraryItem[] = mediaItems
        .filter((m) => urlCache.current[m.storage_path])
        .map((m) => ({
          ...m,
          signedUrl: urlCache.current[m.storage_path],
        }));

      setLibraryItems(items);
    }
    setLibraryLoading(false);
  }, []);

  // Fetch when switching to library or when libraryRefreshKey changes
  useEffect(() => {
    if (galleryMode === "library") {
      fetchLibrary();
    }
  }, [galleryMode, fetchLibrary, libraryRefreshKey]);

  const goNext = useCallback(() => {
    setExpandedIndex((i) =>
      i !== null && i < activeCount - 1 ? i + 1 : i
    );
    setCopied(false);
  }, [activeCount]);

  const goPrev = useCallback(() => {
    setExpandedIndex((i) => (i !== null && i > 0 ? i - 1 : i));
    setCopied(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!expandedSrc) return;
    const link = document.createElement("a");
    link.href = expandedSrc;
    link.download = expandedImage
      ? `cardlab-${expandedImage.id}.png`
      : `cardlab-${expandedLibraryItem?.id ?? "image"}.png`;
    link.click();
  }, [expandedSrc, expandedImage, expandedLibraryItem]);

  const handleCopyPrompt = useCallback(() => {
    if (!expandedImage) return;
    navigator.clipboard.writeText(expandedImage.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [expandedImage]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    const ids = Array.from(selectedIds);
    const result = await deleteMedia(ids);
    if (result.success) {
      // Invalidate URL cache for deleted items
      for (const item of libraryItems) {
        if (selectedIds.has(item.id)) {
          delete urlCache.current[item.storage_path];
        }
      }
      setSelectedIds(new Set());
      await fetchLibrary();
    }
    setIsDeleting(false);
  }, [selectedIds, libraryItems, fetchLibrary]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (expandedIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") setExpandedIndex(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expandedIndex, goNext, goPrev]);

  return (
    <div className="flex flex-col p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
          <button
            onClick={() => {
              setGalleryMode("session");
              setExpandedIndex(null);
              setSelectedIds(new Set());
            }}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              galleryMode === "session"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Session
            {images.length > 0 && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {images.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setGalleryMode("library");
              setExpandedIndex(null);
              setSelectedIds(new Set());
            }}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              galleryMode === "library"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Library
          </button>
        </div>

        <div className="flex items-center gap-1">
          {galleryMode === "session" && images.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClearHistory}
              className="text-muted-foreground hover:text-destructive"
              title="Clear session"
            >
              <IconTrash className="size-4" />
            </Button>
          )}
          {galleryMode === "library" && selectedIds.size > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive"
              title={`Delete ${selectedIds.size} selected`}
            >
              {isDeleting ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconTrash className="size-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Upload zone (library mode only) */}
      {galleryMode === "library" && (
        <div className="mb-3">
          <UploadZone onUploadComplete={fetchLibrary} />
        </div>
      )}

      {/* Loading state */}
      {galleryMode === "session" && isGenerating && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <LoaderThree />
          <p className="text-sm text-muted-foreground">
            Generating your image...
          </p>
        </div>
      )}

      {galleryMode === "library" && libraryLoading && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading library...
          </p>
        </div>
      )}

      {/* Empty states */}
      {galleryMode === "session" && !isGenerating && images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Your generated images will appear here.
          </p>
        </div>
      )}

      {galleryMode === "library" &&
        !libraryLoading &&
        libraryItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Your saved images will appear here.
            </p>
          </div>
        )}

      {/* Session grid */}
      {galleryMode === "session" && images.length > 0 && (
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-2 gap-4 p-2 sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="overflow-visible"
                >
                  <ImageCard
                    image={image}
                    onClick={() => {
                      setExpandedIndex(index);
                      setCopied(false);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Library grid */}
      {galleryMode === "library" &&
        !libraryLoading &&
        libraryItems.length > 0 && (
          <div className="max-h-[calc(100vh-18rem)] overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-2 gap-4 p-2 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence>
                {libraryItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="overflow-visible"
                  >
                    <div
                      className={`group relative cursor-pointer overflow-hidden rounded-xl bg-muted transition-all duration-200 hover:z-10 hover:scale-110 ${
                        selectedIds.has(item.id)
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : ""
                      }`}
                      onClick={() => {
                        setExpandedIndex(index);
                        setCopied(false);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        toggleSelect(item.id);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.signedUrl}
                        alt={item.original_name ?? "Image"}
                        className="aspect-square w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

                      {/* Selection checkbox */}
                      <button
                        className={`absolute left-2 top-2 flex size-5 items-center justify-center rounded border transition-all ${
                          selectedIds.has(item.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white/50 bg-black/30 opacity-0 group-hover:opacity-100"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                      >
                        {selectedIds.has(item.id) && (
                          <IconCheck className="size-3" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

      {/* Expanded lightbox */}
      <AnimatePresence>
        {expandedSrc && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedIndex(null)}
            />
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              onClick={() => setExpandedIndex(null)}
            >
              {/* Prev button */}
              {expandedIndex !== null && expandedIndex > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 z-10 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                >
                  <IconChevronLeft className="size-5" />
                </Button>
              )}

              {/* Next button */}
              {expandedIndex !== null &&
                expandedIndex < activeCount - 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 z-10 rounded-full bg-background/80 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                  >
                    <IconChevronRight className="size-5" />
                  </Button>
                )}

              <motion.div
                key={
                  expandedImage?.id ?? expandedLibraryItem?.id ?? "lightbox"
                }
                className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-2xl bg-background shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between p-3">
                  <span className="text-xs text-muted-foreground">
                    {expandedIndex !== null ? expandedIndex + 1 : 0} /{" "}
                    {activeCount}
                  </span>
                  <div className="flex items-center gap-2">
                    {expandedImage && (
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {expandedImage.model.includes("pro")
                            ? "Pro"
                            : "Flash"}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {expandedImage.aspectRatio}
                        </Badge>
                        {expandedImage.stylePreset &&
                          expandedImage.stylePreset !== "none" && (
                            <Badge
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {expandedImage.stylePreset}
                            </Badge>
                          )}
                      </div>
                    )}
                    {expandedLibraryItem && (
                      <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {expandedLibraryItem.original_name}
                      </span>
                    )}
                    <div className="flex gap-1">
                      {expandedImage && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleCopyPrompt}
                          title="Copy prompt"
                        >
                          {copied ? (
                            <IconCheck className="size-4 text-green-500" />
                          ) : (
                            <IconCopy className="size-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleDownload}
                        title="Download image"
                      >
                        <IconDownload className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setExpandedIndex(null)}
                        title="Close"
                      >
                        <IconX className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={expandedSrc}
                  alt={expandedAlt}
                  className="max-h-[70vh] w-full object-contain px-4 pb-4"
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
