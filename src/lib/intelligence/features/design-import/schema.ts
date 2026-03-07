import { z } from "zod/v4";

const propertyTypeSchema = z.enum([
  "text",
  "number",
  "image",
  "select",
  "boolean",
  "color",
]);

export const detectedPropertySchema = z.object({
  name: z.string().describe("Human-readable property name (e.g. 'Card Name', 'Cost', 'Attack')"),
  type: propertyTypeSchema.describe("Inferred type based on the content values"),
  textItemIndices: z.array(z.number()).default([]).describe("Indices into the first page's textItems array that correspond to this property"),
});

export const detectedLayoutElementSchema = z.object({
  elementType: z.enum(["text", "image"]).describe("Whether this is a text overlay or image placeholder"),
  bindToPropertyName: z.string().describe("The property name this element displays (must match a detected property name)"),
  x: z.number().describe("X position in PDF points from left edge"),
  y: z.number().describe("Y position in PDF points from top edge"),
  width: z.number().describe("Width in PDF points"),
  height: z.number().describe("Height in PDF points"),
  zIndex: z.number().describe("Z-order (1+ for overlays, 0 is reserved for background)"),
  textStyle: z
    .object({
      fontSize: z.number(),
      fontWeight: z.enum(["normal", "bold"]),
      textAlign: z.enum(["left", "center", "right"]),
      color: z.string().describe("Hex color like #ffffff"),
      fontFamily: z.string().optional(),
    })
    .optional()
    .describe("Style for text elements"),
  imageStyle: z
    .object({
      objectFit: z.enum(["cover", "contain", "fill"]),
      borderRadius: z.number().optional(),
    })
    .optional()
    .describe("Style for image elements"),
});

export const detectedCardSchema = z.object({
  pageNumber: z.number().describe("The PDF page number this card comes from (1-indexed)"),
  data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).describe(
    "Card data keyed by property name (must match detected property names)"
  ),
});

export const analysisResultSchema = z.object({
  projectName: z.string().describe("Suggested project name based on the file or content"),
  cardWidth: z.number().describe("Card width in pixels at 300 DPI"),
  cardHeight: z.number().describe("Card height in pixels at 300 DPI"),
  properties: z.array(detectedPropertySchema).describe(
    "Properties detected by comparing text across pages — text that varies = card data"
  ),
  layoutElements: z.array(detectedLayoutElementSchema).describe(
    "Canvas elements to overlay on the card background image"
  ),
  artworkBounds: z
    .object({
      x: z.number().describe("X position in PDF points"),
      y: z.number().describe("Y position in PDF points"),
      width: z.number().describe("Width in PDF points"),
      height: z.number().describe("Height in PDF points"),
    })
    .nullable()
    .describe("Bounding box of the main artwork/illustration area to crop, or null if no distinct artwork area"),
  cards: z.array(detectedCardSchema).describe("Extracted card data from each analyzed page"),
  confidence: z.number().min(0).max(1).describe("Confidence score from 0 to 1"),
  reasoning: z.string().describe("Brief explanation of how properties and layout were identified"),
});
