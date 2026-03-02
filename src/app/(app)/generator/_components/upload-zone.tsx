"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IconUpload, IconX, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { uploadMedia } from "@/lib/actions/media";

type FileUploadStatus = {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

type UploadZoneProps = {
  onUploadComplete: () => void;
};

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploads, setUploads] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const items: FileUploadStatus[] = acceptedFiles.map((file) => ({
        file,
        status: "pending" as const,
      }));
      setUploads(items);
      setIsUploading(true);

      const results = [...items];

      await Promise.all(
        results.map(async (item, index) => {
          results[index] = { ...item, status: "uploading" };
          setUploads([...results]);

          const formData = new FormData();
          formData.append("file", item.file);
          const result = await uploadMedia(formData);

          if (result.success) {
            results[index] = { ...item, status: "done" };
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

      // Clear and refresh after a short delay so user sees the results
      setTimeout(() => {
        setUploads([]);
        onUploadComplete();
      }, 1500);
    },
    [onUploadComplete]
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

  if (uploads.length > 0) {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
        <span className="text-xs font-medium text-muted-foreground">
          Uploading {uploads.length} file{uploads.length > 1 ? "s" : ""}
        </span>
        <div className="space-y-1">
          {uploads.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs"
            >
              {item.status === "uploading" && (
                <IconLoader2 className="size-3.5 animate-spin text-muted-foreground" />
              )}
              {item.status === "done" && (
                <IconCheck className="size-3.5 text-green-500" />
              )}
              {item.status === "error" && (
                <IconX className="size-3.5 text-destructive" />
              )}
              {item.status === "pending" && (
                <div className="size-3.5" />
              )}
              <span className="truncate">{item.file.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <input {...getInputProps()} />
      <IconUpload className="size-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {isDragActive ? "Drop files here" : "Drop images or click to upload"}
      </span>
    </div>
  );
}
