"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GenerateTab } from "./generate-tab";
import { EditTab } from "./edit-tab";
import { ImageGallery } from "./image-gallery";
import { generateImageAction } from "@/lib/actions/image";
import type { GeneratedImage } from "@/lib/intelligence/features/image-generation";
import type {
  GenerationMode,
  AspectRatio,
  ImageModel,
} from "@/lib/intelligence/core/types";

export function GeneratorClient() {
  const [mode, setMode] = useState<GenerationMode>("generate");
  const [model, setModel] = useState<ImageModel>("gemini-2.5-flash-image");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [stylePreset, setStylePreset] = useState("none");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    if (mode === "edit" && !sourceImage) return;

    setIsGenerating(true);
    setError(null);

    const result = await generateImageAction({
      prompt: prompt.trim(),
      model,
      mode,
      aspectRatio,
      numberOfImages,
      seed,
      stylePreset,
      sourceImage: mode === "edit" ? (sourceImage ?? undefined) : undefined,
    });

    if (result.success) {
      setGeneratedImages((prev) => [...result.images, ...prev]);
      // Bump refresh key so library view picks up the new images
      setLibraryRefreshKey((k) => k + 1);
    } else {
      setError(result.error);
    }
    setIsGenerating(false);
  }, [
    prompt,
    model,
    mode,
    aspectRatio,
    numberOfImages,
    seed,
    stylePreset,
    sourceImage,
  ]);

  const handleClearHistory = useCallback(() => {
    setGeneratedImages([]);
  }, []);

  const advancedOptionsProps = {
    model,
    setModel,
    aspectRatio,
    setAspectRatio,
    numberOfImages,
    setNumberOfImages,
    seed,
    setSeed,
    stylePreset,
    setStylePreset,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Generator</h1>
        <p className="mt-1 text-muted-foreground">
          Create and refine artwork for your cards.
        </p>
      </div>

      <div className="grid gap-0 overflow-hidden rounded-2xl border border-border lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ImageGallery
          images={generatedImages}
          isGenerating={isGenerating}
          onClearHistory={handleClearHistory}
          libraryRefreshKey={libraryRefreshKey}
        />

        <div className="flex flex-col gap-4 border-t border-border bg-muted/30 p-5 lg:border-l lg:border-t-0">
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as GenerationMode)}
          >
            <TabsList>
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent value="generate">
              <GenerateTab
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                error={error}
                {...advancedOptionsProps}
              />
            </TabsContent>
            <TabsContent value="edit">
              <EditTab
                prompt={prompt}
                setPrompt={setPrompt}
                sourceImage={sourceImage}
                setSourceImage={setSourceImage}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                error={error}
                {...advancedOptionsProps}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
