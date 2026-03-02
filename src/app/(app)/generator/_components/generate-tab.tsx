"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdvancedOptions, type AdvancedOptionsProps } from "./advanced-options";
import { IconSparkles } from "@tabler/icons-react";

type GenerateTabProps = {
  prompt: string;
  setPrompt: (v: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  error: string | null;
} & AdvancedOptionsProps;

export function GenerateTab({
  prompt,
  setPrompt,
  isGenerating,
  onGenerate,
  error,
  ...advancedProps
}: GenerateTabProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <Textarea
        placeholder="Describe the image you want to generate..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-32 resize-none"
        disabled={isGenerating}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onGenerate();
          }
        }}
      />

      <AdvancedOptions {...advancedProps} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating...
          </span>
        ) : (
          <>
            <IconSparkles className="size-4" />
            Generate
          </>
        )}
      </Button>
    </div>
  );
}
