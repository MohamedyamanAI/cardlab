"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconAlertTriangle } from "@tabler/icons-react";
import { analyzeDesign } from "@/lib/actions/design-import";
import type { ParsedDesignFile, AnalysisResult } from "@/lib/types/design-import";
import type { UsageData } from "@/lib/intelligence/core/pricing";
import type { PipelineLog } from "./design-import-dialog";

interface AnalysisStepProps {
  parsedFile: ParsedDesignFile;
  onAnalysisComplete: (analysis: AnalysisResult) => void;
  onBack: () => void;
  log: PipelineLog;
}

export function AnalysisStep({
  parsedFile,
  onAnalysisComplete,
  onBack,
  log,
}: AnalysisStepProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const logRef = useRef(log);
  useEffect(() => { logRef.current = log; });

  useEffect(() => {
    let cancelled = false;

    async function analyze() {
      const l = logRef.current;
      setLoading(true);
      setError(null);

      l.declare("ai-analysis", "AI analysis (Gemini)");
      l.start("ai-analysis");

      const result = await analyzeDesign(parsedFile);

      if (cancelled) return;

      if (!result.success) {
        l.error("ai-analysis", {
          message: result.error,
          rawData: {
            error: result.error,
            inputSummary: {
              fileName: parsedFile.fileName,
              pageCount: parsedFile.pageCount,
              pagesAnalyzed: parsedFile.pages.length,
              totalTextItems: parsedFile.pages.reduce(
                (sum, p) => sum + p.textItems.length,
                0
              ),
            },
          },
        });
        setError(result.error);
        setLoading(false);
        return;
      }

      l.success("ai-analysis", {
        message: `${result.data.analysis.properties.length} properties, ${result.data.analysis.cards.length} cards (${Math.round(result.data.analysis.confidence * 100)}%)`,
        rawData: {
          prompt: result.data.prompt,
          analysis: result.data.analysis,
          usage: result.data.usage,
          rawResponse: result.data.rawResponse,
        },
      });

      setAnalysis(result.data.analysis);
      setUsage(result.data.usage);
      setLoading(false);
    }

    analyze();
    return () => {
      cancelled = true;
    };
  }, [parsedFile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">
          Analyzing design file with AI...
        </p>
        <p className="text-xs text-muted-foreground">
          This may take a moment
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center py-8">
          <IconAlertTriangle size={40} className="text-destructive" />
          <p className="mt-3 text-sm text-destructive">{error}</p>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!analysis || !usage) return null;

  return (
    <div className="space-y-4">
      {/* Detected Properties */}
      <div>
        <h4 className="mb-2 text-sm font-medium">
          Detected Properties ({analysis.properties.length})
        </h4>
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {analysis.properties.map((prop, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-2">{prop.name}</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {prop.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border p-3 text-sm space-y-1">
        <p>
          <span className="text-muted-foreground">Cards detected:</span>{" "}
          {analysis.cards.length}
        </p>
        <p>
          <span className="text-muted-foreground">Card size:</span>{" "}
          {analysis.cardWidth} × {analysis.cardHeight} px
        </p>
        <p>
          <span className="text-muted-foreground">Layout elements:</span>{" "}
          {analysis.layoutElements.length}
        </p>
        {analysis.artworkBounds && (
          <p>
            <span className="text-muted-foreground">Artwork area:</span>{" "}
            {Math.round(analysis.artworkBounds.width)} ×{" "}
            {Math.round(analysis.artworkBounds.height)} pts
          </p>
        )}
        <p>
          <span className="text-muted-foreground">Confidence:</span>{" "}
          {Math.round(analysis.confidence * 100)}%
        </p>
      </div>

      {/* AI Reasoning */}
      <details className="rounded-lg border">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
          AI Reasoning
        </summary>
        <p className="px-3 pb-3 text-xs text-muted-foreground whitespace-pre-wrap">
          {analysis.reasoning}
        </p>
      </details>

      {/* Usage */}
      <div className="text-xs text-muted-foreground">
        {usage.totalTokens.toLocaleString()} tokens · $
        {usage.cost.totalCost.toFixed(4)}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => onAnalysisComplete(analysis)}>
          Review & Import
          <IconArrowRight size={14} className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
