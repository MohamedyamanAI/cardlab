import { useState, useCallback } from "react";
import {
  renderPage,
  extractPageImages,
  extractImagePlacements,
  cropRegion,
  extractPageText,
  type PDFDocumentProxy,
} from "@/lib/utils/design-import";
import { executeDesignImport } from "@/lib/actions/design-import";
import type {
  ParsedDesignFile,
  AnalysisResult,
  DesignImportResult,
  DetectedProperty,
  DetectedCard,
} from "@/lib/types/design-import";
import type { PipelineLog } from "./use-pipeline-log";

// Scale for full-resolution renders (300 DPI / 72 DPI = ~4.17)
const FULL_RES_SCALE = 300 / 72;

/** Decode a base64 PNG to get its pixel area (width × height). */
function getBase64ImageArea(base64: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width * img.height);
    img.onerror = () => resolve(Infinity); // treat as full-page on error
    img.src = `data:image/png;base64,${base64}`;
  });
}

interface UseImportPipelineArgs {
  parsedFile: ParsedDesignFile | null;
  pdfDocument: PDFDocumentProxy | null;
  analysis: AnalysisResult | null;
  log: PipelineLog;
}

export function useImportPipeline({
  parsedFile,
  pdfDocument,
  analysis,
  log,
}: UseImportPipelineArgs) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<DesignImportResult | null>(null);

  const executeImport = useCallback(
    async (adjusted: {
      projectName: string;
      properties: DetectedProperty[];
      cards: DetectedCard[];
    }) => {
      if (!parsedFile || !pdfDocument || !analysis) return;

      setImporting(true);

      log.declare("render-template", "Render template image");
      log.declare("extract-remaining", "Extract remaining pages");
      log.declare("extract-artwork", "Extract artwork images");
      log.declare("server-import", "Execute server import");

      try {
        // --- Render template ---
        log.start("render-template");
        const templateImageBase64 = await renderPage(
          pdfDocument,
          1,
          FULL_RES_SCALE
        );
        log.success("render-template", {
          message: `${Math.round(parsedFile.pageWidth * FULL_RES_SCALE)}×${Math.round(parsedFile.pageHeight * FULL_RES_SCALE)} px`,
          rawData: {
            scale: FULL_RES_SCALE,
            outputWidth: Math.round(parsedFile.pageWidth * FULL_RES_SCALE),
            outputHeight: Math.round(parsedFile.pageHeight * FULL_RES_SCALE),
            base64Length: templateImageBase64.length,
          },
        });

        // --- Extract remaining pages ---
        const allCards = [...adjusted.cards];
        const remainingPages = pdfDocument.numPages - parsedFile.pages.length;

        if (remainingPages > 0) {
          log.start("extract-remaining");
          let extracted = 0;
          for (
            let i = parsedFile.pages.length + 1;
            i <= pdfDocument.numPages;
            i++
          ) {
            const textItems = await extractPageText(pdfDocument, i);
            const existingCard = allCards.find((c) => c.pageNumber === i);
            if (!existingCard) {
              const data: Record<string, string | number | boolean | null> = {};
              for (const prop of adjusted.properties) {
                for (const idx of prop.textItemIndices) {
                  if (idx < textItems.length) {
                    data[prop.name] = textItems[idx].text;
                  }
                }
              }
              allCards.push({ pageNumber: i, data });
            }
            extracted++;
          }
          log.success("extract-remaining", {
            message: `${extracted} pages`,
            rawData: {
              pagesExtracted: extracted,
              totalCards: allCards.length,
              newCardsData: allCards.slice(adjusted.cards.length),
            },
          });
        } else {
          log.skip("extract-remaining", "All pages already analyzed");
        }

        // --- Extract artwork images ---
        const cardArtworkBase64: Array<{
          pageNumber: number;
          base64: string;
        }> = [];

        log.start("extract-artwork");
        let directExtracted = 0;
        let pdfCropped = 0;
        let aiCropped = 0;
        let failed = 0;

        const pageArea = parsedFile.pageWidth * parsedFile.pageHeight;

        for (const card of allCards) {
          try {
            const images = await extractPageImages(
              pdfDocument,
              card.pageNumber
            );
            const pagePixelArea =
              parsedFile.pageWidth *
              FULL_RES_SCALE *
              parsedFile.pageHeight *
              FULL_RES_SCALE;

            let usedDirect = false;
            if (images.length > 0) {
              const imgArea = await getBase64ImageArea(images[0]);
              if (imgArea < pagePixelArea * 0.8) {
                cardArtworkBase64.push({
                  pageNumber: card.pageNumber,
                  base64: images[0],
                });
                directExtracted++;
                usedDirect = true;
              }
            }

            if (!usedDirect) {
              const placements = await extractImagePlacements(
                pdfDocument,
                card.pageNumber
              );
              const candidates = placements.filter(
                (p) =>
                  p.width * p.height < pageArea * 0.9 &&
                  p.width * p.height > pageArea * 0.01
              );

              let exactBounds: {
                x: number;
                y: number;
                width: number;
                height: number;
              } | null = null;

              if (candidates.length === 1) {
                exactBounds = candidates[0];
              } else if (candidates.length > 1 && analysis.artworkBounds) {
                const aiCx =
                  analysis.artworkBounds.x + analysis.artworkBounds.width / 2;
                const aiCy =
                  analysis.artworkBounds.y + analysis.artworkBounds.height / 2;
                let best = candidates[0];
                let bestDist = Infinity;
                for (const c of candidates) {
                  const dist = Math.hypot(
                    c.x + c.width / 2 - aiCx,
                    c.y + c.height / 2 - aiCy
                  );
                  if (dist < bestDist) {
                    bestDist = dist;
                    best = c;
                  }
                }
                exactBounds = best;
              } else if (candidates.length > 1) {
                exactBounds = candidates[0];
              }

              const pageRender = await renderPage(
                pdfDocument,
                card.pageNumber,
                FULL_RES_SCALE
              );

              if (exactBounds) {
                const croppedBase64 = await cropRegion(
                  pageRender,
                  exactBounds,
                  FULL_RES_SCALE,
                  parsedFile.pageWidth,
                  parsedFile.pageHeight,
                  0
                );
                cardArtworkBase64.push({
                  pageNumber: card.pageNumber,
                  base64: croppedBase64,
                });
                pdfCropped++;
              } else if (analysis.artworkBounds) {
                const croppedBase64 = await cropRegion(
                  pageRender,
                  analysis.artworkBounds,
                  FULL_RES_SCALE,
                  parsedFile.pageWidth,
                  parsedFile.pageHeight,
                  0.05
                );
                cardArtworkBase64.push({
                  pageNumber: card.pageNumber,
                  base64: croppedBase64,
                });
                aiCropped++;
              } else {
                cardArtworkBase64.push({
                  pageNumber: card.pageNumber,
                  base64: pageRender,
                });
                aiCropped++;
              }
            }
          } catch (err) {
            failed++;
            log.setRawData("extract-artwork", {
              lastError: {
                page: card.pageNumber,
                error: err instanceof Error ? err.message : String(err),
              },
            });
          }
        }

        if (failed > 0) {
          log.error("extract-artwork", {
            message: `${directExtracted} embedded, ${pdfCropped} PDF-cropped, ${aiCropped} AI-cropped, ${failed} failed`,
            rawData: {
              directExtracted,
              pdfCropped,
              aiCropped,
              failed,
              pageArea,
            },
          });
        } else {
          log.success("extract-artwork", {
            message: `${directExtracted} embedded, ${pdfCropped} PDF-cropped, ${aiCropped} AI-cropped`,
            rawData: { directExtracted, pdfCropped, aiCropped, pageArea },
          });
        }

        // --- Server import ---
        log.start("server-import");
        const payload = {
          projectName: adjusted.projectName,
          cardWidth: analysis.cardWidth,
          cardHeight: analysis.cardHeight,
          pageWidth: parsedFile.pageWidth,
          pageHeight: parsedFile.pageHeight,
          properties: adjusted.properties,
          layoutElements: analysis.layoutElements,
          artworkBounds: analysis.artworkBounds,
          cards: allCards,
          templateImageBase64,
          cardArtworkBase64,
        };

        const importResult = await executeDesignImport(payload);

        if (importResult.success) {
          log.success("server-import", {
            message: `${importResult.data.cardsCreated} cards, ${importResult.data.mediaUploaded} images`,
            rawData: importResult.data,
          });
          setResult(importResult.data);
          setImporting(false);
          return importResult.data;
        } else {
          log.error("server-import", {
            message: importResult.error,
            rawData: {
              error: importResult.error,
              payloadSummary: {
                projectName: payload.projectName,
                propertiesCount: payload.properties.length,
                cardsCount: payload.cards.length,
                artworkCount: payload.cardArtworkBase64.length,
                templateBase64Length: payload.templateImageBase64.length,
              },
            },
          });
          setImporting(false);
        }
      } catch (err) {
        log.error("server-import", {
          message: err instanceof Error ? err.message : "Unknown error",
          rawData:
            err instanceof Error
              ? { name: err.name, message: err.message, stack: err.stack }
              : err,
        });
        setImporting(false);
        return null;
      }
    },
    [parsedFile, pdfDocument, analysis, log]
  );

  const reset = useCallback(() => {
    setImporting(false);
    setResult(null);
  }, []);

  return { importing, result, executeImport, reset };
}
