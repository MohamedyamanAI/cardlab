"use server";

import { createClient } from "@/lib/supabase/server";
import * as projectsRepo from "@/lib/repository/projects";
import * as propertiesRepo from "@/lib/repository/properties";
import * as layoutsRepo from "@/lib/repository/layouts";
import * as cardsRepo from "@/lib/repository/cards";
import * as mediaRepo from "@/lib/repository/media";
import { analyzeDesignFile } from "@/lib/intelligence/features/design-import/logic";
import {
  analyzeDesignSchema,
  executeDesignImportSchema,
} from "@/lib/validations/design-import";
import {
  createTextElement,
  createImageElement,
} from "@/lib/utils/canvas-element-factory";
import type { ActionResult } from "@/lib/types";
import type {
  ParsedDesignFile,
  AnalysisResult,
  DesignImportResult,
} from "@/lib/types/design-import";
import type { UsageData } from "@/lib/intelligence/core/pricing";
import type { CanvasElement } from "@/lib/types/canvas-elements";

export async function analyzeDesign(
  input: ParsedDesignFile
): Promise<ActionResult<{
  analysis: AnalysisResult;
  usage: UsageData;
  prompt: { system: string; user: string; model: string };
  rawResponse: { text: string; reasoning: string | undefined };
}>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = analyzeDesignSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid design file data" };
  }

  try {
    const result = await analyzeDesignFile(input);
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `AI analysis failed: ${message}` };
  }
}

export async function executeDesignImport(
  input: {
    projectName: string;
    cardWidth: number;
    cardHeight: number;
    pageWidth: number;
    pageHeight: number;
    properties: AnalysisResult["properties"];
    layoutElements: AnalysisResult["layoutElements"];
    artworkBounds: AnalysisResult["artworkBounds"];
    cards: AnalysisResult["cards"];
    templateImageBase64: string;
    cardArtworkBase64: Array<{ pageNumber: number; base64: string }>;
  }
): Promise<ActionResult<DesignImportResult>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = executeDesignImportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid import data" };
  }

  const errors: Array<{ step: string; message: string }> = [];
  let mediaUploaded = 0;

  try {
    // 1. Create project
    const project = await projectsRepo.createProject(supabase, user.id, {
      name: input.projectName,
    });

    // 2. Create properties (including artwork image property if artwork bounds exist)
    const propertyInputs = input.properties.map((p) => ({
      name: p.name,
      type: p.type,
    }));

    // Add artwork property if we have artwork bounds
    const hasArtwork = input.artworkBounds !== null;
    if (hasArtwork) {
      const hasArtworkProp = propertyInputs.some(
        (p) => p.type === "image" && p.name.toLowerCase().includes("artwork")
      );
      if (!hasArtworkProp) {
        propertyInputs.push({ name: "Artwork", type: "image" });
      }
    }

    const createdProperties = await propertiesRepo.bulkCreateProperties(
      supabase,
      project.id,
      propertyInputs
    );

    // Build name -> slug map
    const nameToSlug = new Map<string, string>();
    for (const prop of createdProperties) {
      nameToSlug.set(prop.name, prop.slug);
    }

    // 3. Create layout
    const layout = await layoutsRepo.createLayout(supabase, {
      project_id: project.id,
      name: "Imported Layout",
      width: input.cardWidth,
      height: input.cardHeight,
    });

    // 4. Upload template background image
    let bgStoragePath: string | undefined;
    try {
      const buffer = Buffer.from(input.templateImageBase64, "base64");
      const uuid = crypto.randomUUID();
      const storagePath = `users/${user.id}/${uuid}_template.png`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(storagePath, buffer, {
          contentType: "image/png",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      await mediaRepo.createMediaRecord(supabase, {
        userId: user.id,
        originalName: "template_background.png",
        mimeType: "image/png",
        sizeBytes: buffer.byteLength,
        storagePath,
        type: "image",
      });

      bgStoragePath = storagePath;
      mediaUploaded++;
    } catch {
      errors.push({
        step: "template_upload",
        message: "Failed to upload template background image",
      });
    }

    // 5. Build canvas elements
    const elements: CanvasElement[] = [];

    // Background image at z_index 0 (full bleed)
    if (bgStoragePath) {
      // Get a signed URL for the background
      const { data: signedData } = await supabase.storage
        .from("media")
        .createSignedUrl(bgStoragePath, 3600 * 24 * 365);

      elements.push(
        createImageElement({
          x: 0,
          y: 0,
          width: input.cardWidth,
          height: input.cardHeight,
          z_index: 0,
          static_src: signedData?.signedUrl ?? bgStoragePath,
          object_fit: "fill",
        })
      );
    }

    // Overlay elements from layout detection
    // Scale factor: PDF points → card pixels (e.g. 750px / 180pts = 4.17)
    const pdfToPixelScale = input.cardWidth / input.pageWidth;

    for (const el of input.layoutElements) {
      const slug = nameToSlug.get(el.bindToPropertyName);
      if (!slug) continue;

      if (el.elementType === "text") {
        // AI returns tight text bounding boxes from PDF text items.
        // Expand to reasonable minimums so text isn't clipped in the editor.
        const scaledW = Math.round(el.width * pdfToPixelScale);
        const scaledH = Math.round(el.height * pdfToPixelScale);
        const fontSize = el.textStyle?.fontSize
          ? Math.round(el.textStyle.fontSize * pdfToPixelScale)
          : 24;
        // Width: at least 60% of card width, height: at least 2× font size
        const minWidth = Math.round(input.cardWidth * 0.6);
        const minHeight = fontSize * 2;

        elements.push(
          createTextElement({
            bind_to: slug,
            x: Math.round(el.x * pdfToPixelScale),
            y: Math.round(el.y * pdfToPixelScale),
            width: Math.max(scaledW, minWidth),
            height: Math.max(scaledH, minHeight),
            z_index: el.zIndex,
            font_size: fontSize,
            font_weight: el.textStyle?.fontWeight ?? "normal",
            text_align: el.textStyle?.textAlign ?? "center",
            color: el.textStyle?.color ?? "#ffffff",
            font_family: el.textStyle?.fontFamily,
          })
        );
      } else if (el.elementType === "image") {
        elements.push(
          createImageElement({
            bind_to: slug,
            x: Math.round(el.x * pdfToPixelScale),
            y: Math.round(el.y * pdfToPixelScale),
            width: Math.round(el.width * pdfToPixelScale),
            height: Math.round(el.height * pdfToPixelScale),
            z_index: el.zIndex,
            object_fit: el.imageStyle?.objectFit ?? "cover",
            border_radius: el.imageStyle?.borderRadius,
          })
        );
      }
    }

    // Save canvas elements to layout
    await layoutsRepo.saveCanvasElements(supabase, layout.id, elements);

    // 6. Upload per-card artwork and build card data
    const artworkSlug = hasArtwork
      ? nameToSlug.get("Artwork") ??
        createdProperties.find((p) => p.type === "image")?.slug
      : undefined;

    const cardDataArray: Record<string, unknown>[] = [];

    for (const card of input.cards) {
      const data: Record<string, unknown> = {};

      // Map property names to slugs and set values
      for (const [propName, value] of Object.entries(card.data)) {
        const slug = nameToSlug.get(propName);
        if (slug) {
          data[slug] = value;
        }
      }

      // Upload artwork for this card if available
      if (artworkSlug) {
        const artworkEntry = input.cardArtworkBase64.find(
          (a) => a.pageNumber === card.pageNumber
        );
        if (artworkEntry) {
          try {
            const buffer = Buffer.from(artworkEntry.base64, "base64");
            const uuid = crypto.randomUUID();
            const storagePath = `users/${user.id}/${uuid}_artwork_page${card.pageNumber}.png`;

            const { error: uploadError } = await supabase.storage
              .from("media")
              .upload(storagePath, buffer, {
                contentType: "image/png",
                upsert: false,
              });
            if (uploadError) throw uploadError;

            const media = await mediaRepo.createMediaRecord(supabase, {
              userId: user.id,
              originalName: `artwork_page${card.pageNumber}.png`,
              mimeType: "image/png",
              sizeBytes: buffer.byteLength,
              storagePath,
              type: "image",
            });

            data[artworkSlug] = media.id;
            mediaUploaded++;
          } catch {
            errors.push({
              step: `artwork_page_${card.pageNumber}`,
              message: `Failed to upload artwork for page ${card.pageNumber}`,
            });
          }
        }
      }

      cardDataArray.push(data);
    }

    // 7. Bulk create cards in batches of 500
    const BATCH_SIZE = 500;
    let cardsCreated = 0;
    for (let i = 0; i < cardDataArray.length; i += BATCH_SIZE) {
      const batch = cardDataArray.slice(i, i + BATCH_SIZE);
      await cardsRepo.bulkCreateCards(supabase, project.id, batch);
      cardsCreated += batch.length;
    }

    return {
      success: true,
      data: {
        projectId: project.id,
        projectName: project.name,
        propertiesCreated: createdProperties.length,
        layoutCreated: true,
        cardsCreated,
        mediaUploaded,
        errors,
        canvasElements: elements as unknown as Record<string, unknown>[],
      },
    };
  } catch {
    return { success: false, error: "Failed to import design file" };
  }
}
