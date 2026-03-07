import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { analysisResultSchema } from "./schema";
import { calculateUsage, type UsageData } from "@/lib/intelligence/core/pricing";
import type { ParsedDesignFile, AnalysisResult } from "@/lib/types/design-import";

const MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are an expert at analyzing card game designs from design files (Adobe Illustrator exported as PDF).

You receive:
1. Text items extracted from multiple pages of a card design file, with positions and font info
2. A rendered image of each page/card

Each page in the PDF represents ONE card. Your job is to:

## 1. Identify Properties
Compare the rendered card images across pages. Text that CHANGES between pages is card data (properties). Text that stays the SAME is static template decoration.

For each varying text field, determine:
- A clean property name (e.g. "Card Name", "Cost", "Description")
- The type: "text", "number", "select", "boolean", "color", or "image"

## 2. Extract Card Data — MANDATORY
CRITICAL: The extracted text items contain garbled unicode because Illustrator uses custom font encodings. You MUST ignore the text item strings entirely.

Instead, look at each card image I'm sending you. Read the visible text on each card image with your eyes. Every card MUST have data filled in — returning empty data objects is NOT acceptable.

Example: If you detect properties "Card Name" (text) and "Cost" (number), and you see "Fire Dragon" and "500" on card 1, return:
{"pageNumber": 1, "data": {"Card Name": "Fire Dragon", "Cost": 500}}

You MUST do this for EVERY page. Never return {"data": {}}.

## 3. Detect Layout Elements
For each property, specify where on the card template it appears as an overlay element. Use the text item positions from page 1 as positional reference (coordinates are in PDF points from top-left).

IMPORTANT positioning rules:
- x, y, width, height are ALL in PDF points (same unit as the input text items)
- fontSize is ALSO in PDF points (same unit — do NOT convert to pixels)
- The width/height should be the FULL bounding box of the text region, not a tight character-level box. Include enough space for the longest value across all cards.
- Infer font weight, alignment, and color from the visual appearance.

## 4. Identify Artwork Area
Look for the main illustration/artwork area — typically the largest region without text. Return its bounding box in PDF points, or null if no distinct artwork region exists.

## 5. Card Dimensions
Convert PDF page dimensions (in points, 72 DPI) to pixels at 300 DPI: pixels = points × (300 / 72)

## Rules
- Only include properties whose text actually varies between pages
- ALL measurements (x, y, width, height, fontSize) in PDF points (same coordinate system as input text items)
- z-index 0 is reserved for background — overlay elements start at z-index 1
- If artwork area exists, include an "Artwork" property with type "image"
- Card data keys MUST match detected property names exactly
- NEVER return empty card data — read the text from the card images

## Output Format
Respond with a single JSON object (no markdown fences, no extra text) with this exact structure:
{
  "projectName": "string",
  "cardWidth": number,
  "cardHeight": number,
  "properties": [{"name": "string", "type": "text|number|select|boolean|color|image", "textItemIndices": [number]}],
  "layoutElements": [{"elementType": "text|image", "bindToPropertyName": "string", "x": number, "y": number, "width": number, "height": number, "zIndex": number, "textStyle": {"fontSize": number, "fontWeight": "normal|bold", "textAlign": "left|center|right", "color": "string", "fontFamily": "string"}, "imageStyle": {"objectFit": "cover|contain|fill", "borderRadius": number}}],
  "artworkBounds": {"x": number, "y": number, "width": number, "height": number} | null,
  "cards": [{"pageNumber": number, "data": {"Property Name": "value"}}],
  "confidence": number,
  "reasoning": "string"
}`;

export async function analyzeDesignFile(
  parsedData: ParsedDesignFile
): Promise<{
  analysis: AnalysisResult;
  usage: UsageData;
  prompt: { system: string; user: string; model: string };
  rawResponse: { text: string; reasoning: string | undefined };
}> {
  // Build text comparison data for the prompt
  const pagesText = parsedData.pages.map((page) => ({
    pageNumber: page.pageNumber,
    textItems: page.textItems.map((item, idx) => ({
      index: idx,
      text: item.text,
      x: Math.round(item.x),
      y: Math.round(item.y),
      width: Math.round(item.width),
      height: Math.round(item.height),
      fontName: item.fontName,
      fontSize: item.fontSize,
    })),
  }));

  const userPrompt = `Analyze this card game design file.

File: ${parsedData.fileName}
Page count: ${parsedData.pageCount} (each page = one card)
Page dimensions: ${Math.round(parsedData.pageWidth)} × ${Math.round(parsedData.pageHeight)} PDF points

Text items extracted from ${parsedData.pages.length} pages (positions are useful for layout, but the text strings are GARBLED — ignore them and read text from the images instead):
${JSON.stringify(pagesText, null, 2)}

I'm attaching a rendered image of each card page below. You MUST visually read the text on each card image to extract the card data values. Do NOT return empty card data.`;

  // Build message content with all page images
  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image"; image: string; mediaType: string }
  > = [{ type: "text", text: userPrompt }];

  for (const page of parsedData.pages) {
    if (page.thumbnailBase64) {
      userContent.push({
        type: "text",
        text: `Page ${page.pageNumber} (card ${page.pageNumber}):`,
      });
      userContent.push({
        type: "image",
        image: page.thumbnailBase64,
        mediaType: "image/png",
      });
    }
  }

  // Don't use Output.object() — Gemini's strict structured output mode drops
  // data from z.record() fields. Instead, instruct JSON output in the prompt
  // and parse manually with Zod validation.
  const { text, reasoning, usage: rawUsage } = await generateText({
    model: google(MODEL),
    providerOptions: {
      google: {
        thinkingConfig: { includeThoughts: true },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  // Extract JSON from the response (model may include markdown fences)
  let jsonStr = text;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  } else {
    // Try to find a top-level JSON object
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) jsonStr = objMatch[0];
  }

  let analysis: AnalysisResult;
  try {
    const parsed = JSON.parse(jsonStr);
    // Gemini sometimes returns confidence as 0-100 instead of 0-1
    if (typeof parsed.confidence === "number" && parsed.confidence > 1) {
      parsed.confidence = parsed.confidence / 100;
    }
    analysis = analysisResultSchema.parse(parsed) as AnalysisResult;
  } catch (parseErr) {
    throw new Error(
      `Failed to parse AI response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}\n\nRaw text: ${text.slice(0, 1000)}`
    );
  }

  const usage = calculateUsage(rawUsage, MODEL);

  return {
    analysis,
    usage,
    prompt: { system: SYSTEM_PROMPT, user: userPrompt, model: MODEL },
    rawResponse: {
      text,
      reasoning: reasoning?.map((r) => "text" in r ? r.text : "").join("\n"),
    },
  };
}
