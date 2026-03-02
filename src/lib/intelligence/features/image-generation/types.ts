import type {
  AspectRatio,
  GenerationMode,
  ImageModel,
} from "@/lib/intelligence/core/types";

export type GenerateParams = {
  prompt: string;
  mode: GenerationMode;
  model: ImageModel;
  aspectRatio: AspectRatio;
  numberOfImages: number;
  seed?: number;
  stylePresetId?: string;
  sourceImageBase64?: string;
};

export type GeneratedImage = {
  id: string;
  base64: string;
  prompt: string;
  mode: GenerationMode;
  aspectRatio: AspectRatio;
  model: ImageModel;
  seed?: number;
  stylePreset?: string;
  createdAt: string;
  mediaId?: string;
  storageUrl?: string;
};

export type GenerationResult =
  | { success: true; images: GeneratedImage[] }
  | { success: false; error: string };
