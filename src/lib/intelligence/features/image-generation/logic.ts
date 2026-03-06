import { google } from "@ai-sdk/google";
import { generateImage } from "ai";
import { IMAGE_STYLE_PRESETS } from "@/lib/intelligence/core/providers";
import { calculateImageUsage } from "@/lib/intelligence/core/pricing";
import type { GenerateParams, GeneratedImage } from "./types";

export async function generateImages(
  params: GenerateParams
): Promise<GeneratedImage[]> {
  const {
    prompt,
    mode,
    model,
    aspectRatio,
    numberOfImages,
    seed,
    stylePresetId,
    sourceImageBase64,
  } = params;

  const preset = IMAGE_STYLE_PRESETS.find((p) => p.id === stylePresetId);
  const fullPrompt =
    preset && preset.id !== "none"
      ? `${prompt}${preset.promptSuffix}`
      : prompt;

  const promptParam =
    mode === "edit" && sourceImageBase64
      ? {
          text: fullPrompt,
          images: [Buffer.from(sourceImageBase64, "base64")],
        }
      : fullPrompt;

  // Gemini image models don't support n > 1, so we run parallel calls
  const calls = Array.from({ length: numberOfImages }, () =>
    generateImage({
      model: google.image(model),
      prompt: promptParam,
      aspectRatio,
      ...(seed !== undefined && { seed }),
    })
  );

  const results = await Promise.all(calls);

  return results.map((result) => ({
    id: crypto.randomUUID(),
    base64: result.image.base64,
    prompt,
    mode,
    aspectRatio,
    model,
    seed,
    stylePreset: stylePresetId,
    createdAt: new Date().toISOString(),
    usage: result.usage
      ? calculateImageUsage(result.usage, model)
      : undefined,
  }));
}
