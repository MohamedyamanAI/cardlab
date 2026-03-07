import { z } from "zod/v4";
import { propertyTypeSchema } from "./properties";

// --- Analyze Design Schema ---

const textItemSchema = z.object({
  text: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fontName: z.string(),
  fontSize: z.number(),
});

const parsedPageSchema = z.object({
  pageNumber: z.number().int().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  textItems: z.array(textItemSchema),
  thumbnailBase64: z.string().optional(),
});

export const analyzeDesignSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  pageCount: z.number().int().positive(),
  pageWidth: z.number().positive(),
  pageHeight: z.number().positive(),
  pages: z.array(parsedPageSchema).min(1),
  compositeThumbnail: z.string().min(1),
});

// --- Execute Design Import Schema ---

const detectedPropertySchema = z.object({
  name: z.string().min(1).max(50),
  type: propertyTypeSchema,
  textItemIndices: z.array(z.number().int().min(0)).default([]),
});

const detectedLayoutElementSchema = z.object({
  elementType: z.enum(["text", "image"]),
  bindToPropertyName: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  zIndex: z.number().int().min(0),
  textStyle: z
    .object({
      fontSize: z.number().positive(),
      fontWeight: z.enum(["normal", "bold"]),
      textAlign: z.enum(["left", "center", "right"]),
      color: z.string(),
      fontFamily: z.string().optional(),
    })
    .optional(),
  imageStyle: z
    .object({
      objectFit: z.enum(["cover", "contain", "fill"]),
      borderRadius: z.number().optional(),
    })
    .optional(),
});

const detectedCardSchema = z.object({
  pageNumber: z.number().int().positive(),
  data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

export const executeDesignImportSchema = z.object({
  projectName: z.string().min(1).max(100),
  cardWidth: z.number().int().positive(),
  cardHeight: z.number().int().positive(),
  pageWidth: z.number().positive(),
  pageHeight: z.number().positive(),
  properties: z.array(detectedPropertySchema).min(1),
  layoutElements: z.array(detectedLayoutElementSchema),
  artworkBounds: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .nullable(),
  cards: z.array(detectedCardSchema),
  // Base64 images sent from the client
  templateImageBase64: z.string().min(1),
  cardArtworkBase64: z.array(
    z.object({
      pageNumber: z.number().int().positive(),
      base64: z.string().min(1),
    })
  ),
});
