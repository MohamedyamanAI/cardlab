"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "motion/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdvancedOptions, type AdvancedOptionsProps } from "./advanced-options";
import { IconSparkles, IconUpload, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils/utils";

type EditTabProps = {
  prompt: string;
  setPrompt: (v: string) => void;
  sourceImage: string | null;
  setSourceImage: (v: string | null) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  error: string | null;
} & AdvancedOptionsProps;

export function EditTab({
  prompt,
  setPrompt,
  sourceImage,
  setSourceImage,
  isGenerating,
  onGenerate,
  error,
  ...advancedProps
}: EditTabProps) {
  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    },
    [setSourceImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: false,
    disabled: isGenerating,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="flex flex-col gap-4 pt-4">
      <AnimatePresence mode="wait">
        {sourceImage ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sourceImage}
              alt="Source"
              className="max-h-64 w-full rounded-xl bg-muted object-contain"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSourceImage(null)}
              className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm"
            >
              <IconX className="size-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <IconUpload className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop image here"
                  : "Upload a reference image to edit"}
              </p>
              <p className="text-xs text-muted-foreground/60">
                PNG, JPG, WebP up to 10MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Textarea
        placeholder="Describe how you want to modify this image..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-24 resize-none"
        disabled={isGenerating}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onGenerate();
          }
        }}
      />

      <AdvancedOptions {...advancedProps} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim() || !sourceImage}
        className="w-full"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Editing...
          </span>
        ) : (
          <>
            <IconSparkles className="size-4" />
            Edit Image
          </>
        )}
      </Button>
    </div>
  );
}
