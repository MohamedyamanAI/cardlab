"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { IconSparkles, IconAlertTriangle } from "@tabler/icons-react";
import { parseAiFile, type PDFDocumentProxy } from "@/lib/utils/design-import";
import type { ParsedDesignFile } from "@/lib/types/design-import";
import type { PipelineLog } from "./design-import-dialog";

interface UploadStepProps {
  onFileParsed: (
    parsed: ParsedDesignFile,
    pdfDocument: PDFDocumentProxy
  ) => void;
  log: PipelineLog;
}

export function UploadStep({ onFileParsed, log }: UploadStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedDesignFile | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setError(null);
      setWarning(null);
      setParsing(true);

      log.declare("load-pdf", "Load PDF document");
      log.declare("extract-text", "Extract text from pages");
      log.declare("render-thumbnail", "Render thumbnail");

      log.start("load-pdf");

      try {
        const result = await parseAiFile(file);

        // Log the load step
        log.success("load-pdf", {
          message: `${result.parsed.pageCount} pages`,
          rawData: {
            fileName: result.parsed.fileName,
            fileSize: result.parsed.fileSize,
            fileSizeMB: (result.parsed.fileSize / 1024 / 1024).toFixed(2),
            pageCount: result.parsed.pageCount,
            pageWidth: result.parsed.pageWidth,
            pageHeight: result.parsed.pageHeight,
          },
        });

        // Log text extraction
        const totalTextItems = result.parsed.pages.reduce(
          (sum, p) => sum + p.textItems.length,
          0
        );
        log.success("extract-text", {
          message: `${totalTextItems} items from ${result.parsed.pages.length} pages`,
          rawData: {
            pagesAnalyzed: result.parsed.pages.length,
            totalTextItems,
            nativeTextExtraction: result.nativeTextDebug ?? "not found — using pdfjs fallback",
            perPage: result.parsed.pages.map((p) => ({
              page: p.pageNumber,
              items: p.textItems.length,
              sampleTexts: p.textItems.slice(0, 5).map((t) => t.text),
            })),
            allTextItems: result.parsed.pages.flatMap((p) =>
              p.textItems.map((t) => ({
                page: p.pageNumber,
                text: t.text,
                x: Math.round(t.x),
                y: Math.round(t.y),
                fontSize: t.fontSize,
                fontName: t.fontName,
              }))
            ),
          },
        });

        // Log thumbnail
        log.success("render-thumbnail", {
          message: `${Math.round(result.parsed.pageWidth)}×${Math.round(result.parsed.pageHeight)} pts`,
          rawData: {
            thumbnailBase64Length: result.parsed.compositeThumbnail.length,
          },
        });

        setParsed(result.parsed);
        setPdfDoc(result.pdfDocument);
        if (result.warning) setWarning(result.warning);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to parse file";
        log.error("load-pdf", {
          message: msg,
          rawData:
            err instanceof Error
              ? { name: err.name, message: err.message, stack: err.stack }
              : err,
        });
        setError(msg);
      } finally {
        setParsing(false);
      }
    },
    [log]
  );

  const handleAnalyze = () => {
    if (parsed && pdfDoc) {
      onFileParsed(parsed, pdfDoc);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        onChange={handleFileUpload}
        accept={{
          "application/postscript": [".ai"],
          "application/pdf": [".ai"],
        }}
        title="Upload design file"
        subtitle="Drag & drop an Adobe Illustrator (.ai) file"
      />

      {parsing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Parsing file...
        </div>
      )}

      {warning && (
        <div className="flex items-center gap-2 text-sm text-yellow-600">
          <IconAlertTriangle size={14} />
          {warning}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {parsed && !parsing && (
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex gap-4">
              {parsed.compositeThumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${parsed.compositeThumbnail}`}
                  alt="Card preview"
                  className="h-40 rounded border object-contain"
                />
              )}
              <div className="flex-1 space-y-1 text-sm">
                <p className="font-medium">{parsed.fileName}</p>
                <p className="text-muted-foreground">
                  {(parsed.fileSize / 1024 / 1024).toFixed(1)} MB
                </p>
                <p className="text-muted-foreground">
                  {parsed.pageCount} page{parsed.pageCount !== 1 ? "s" : ""}{" "}
                  (card{parsed.pageCount !== 1 ? "s" : ""})
                </p>
                <p className="text-muted-foreground">
                  {Math.round(parsed.pageWidth)} ×{" "}
                  {Math.round(parsed.pageHeight)} points
                </p>
                <p className="text-muted-foreground">
                  {parsed.pages.reduce(
                    (sum, p) => sum + p.textItems.length,
                    0
                  )}{" "}
                  text items extracted
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAnalyze}>
              <IconSparkles size={14} className="mr-1.5" />
              Analyze with AI
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
