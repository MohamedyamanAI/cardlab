"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  generateImages,
  type GenerationResult,
  type GeneratedImage,
} from "@/lib/intelligence/features/image-generation";
import { saveGeneratedImage } from "@/lib/actions/media";

const GenerateImageSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(2000, "Prompt too long"),
  model: z.enum(["gemini-2.5-flash-image", "gemini-3-pro-image-preview"]),
  mode: z.enum(["generate", "edit"]),
  aspectRatio: z.enum([
    "1:1",
    "3:4",
    "4:3",
    "9:16",
    "16:9",
    "2:3",
    "3:2",
    "4:5",
    "5:4",
    "21:9",
  ]),
  numberOfImages: z.number().int().min(1).max(4),
  seed: z.number().int().optional(),
  stylePreset: z.string().optional(),
  sourceImage: z.string().optional(),
});

export async function generateImageAction(
  input: z.input<typeof GenerateImageSchema>
): Promise<GenerationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = GenerateImageSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const {
      prompt,
      model,
      mode,
      aspectRatio,
      numberOfImages,
      seed,
      stylePreset,
      sourceImage,
    } = parsed.data;

    if (mode === "edit" && !sourceImage) {
      return {
        success: false,
        error: "Source image is required for edit mode",
      };
    }

    const sourceImageBase64 = sourceImage?.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    const images = await generateImages({
      prompt,
      model,
      mode,
      aspectRatio,
      numberOfImages,
      seed,
      stylePresetId: stylePreset,
      sourceImageBase64,
    });

    // Auto-save generated images to storage
    const savedImages: GeneratedImage[] = await Promise.all(
      images.map(async (image) => {
        const result = await saveGeneratedImage({
          base64: image.base64,
          prompt: image.prompt,
          aspectRatio: image.aspectRatio,
          model: image.model,
          usage: image.usage as Record<string, unknown> | undefined,
        });
        if (result.success) {
          return { ...image, mediaId: result.data.id };
        }
        return image;
      })
    );

    return { success: true, images: savedImages };
  } catch (error) {
    console.error("Image generation failed:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}
