"use client";

import { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { UploadStep } from "./upload-step";
import { AnalysisStep } from "./analysis-step";
import { ReviewStep } from "./review-step";
import { ResultStep } from "./result-step";
import { PipelinePanel } from "./pipeline-panel";
import { usePipelineLog, type PipelineLog } from "./use-pipeline-log";
import { useImportPipeline } from "./use-import-pipeline";
import { useCardsStore } from "@/lib/store/cards-store";
import type { PDFDocumentProxy } from "@/lib/utils/design-import";
import type {
  ParsedDesignFile,
  AnalysisResult,
  DetectedProperty,
  DetectedCard,
} from "@/lib/types/design-import";

export type { PipelineLog };

interface DesignImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WizardStep = "upload" | "analysis" | "review" | "result";

const STEP_TITLES: Record<WizardStep, string> = {
  upload: "Import Design File",
  analysis: "AI Analysis",
  review: "Review & Import",
  result: "Import Complete",
};

const STEP_DESCRIPTIONS: Record<WizardStep, string> = {
  upload: "Upload an Adobe Illustrator (.ai) file to import your card designs.",
  analysis: "Analyzing your design to detect properties, layout, and card data.",
  review: "Review and adjust the detected structure before importing.",
  result: "",
};

export function DesignImportDialog({
  open,
  onOpenChange,
}: DesignImportDialogProps) {
  const { selectProject } = useCardsStore();
  const log = usePipelineLog();
  const [step, setStep] = useState<WizardStep>("upload");
  const [parsedFile, setParsedFile] = useState<ParsedDesignFile | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const pipeline = useImportPipeline({
    parsedFile,
    pdfDocument,
    analysis,
    log,
  });

  const reset = useCallback(() => {
    setStep("upload");
    setParsedFile(null);
    setPdfDocument(null);
    setAnalysis(null);
    pipeline.reset();
    log.reset();
  }, [log, pipeline]);

  const handleClose = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  // Step 1 -> Step 2
  const handleFileParsed = (
    parsed: ParsedDesignFile,
    pdf: PDFDocumentProxy
  ) => {
    setParsedFile(parsed);
    setPdfDocument(pdf);
    setStep("analysis");
  };

  // Step 2 -> Step 3
  const handleAnalysisComplete = (analysisResult: AnalysisResult) => {
    setAnalysis(analysisResult);
    setStep("review");
  };

  // Step 3 -> Step 4
  const handleConfirm = async (adjusted: {
    projectName: string;
    properties: DetectedProperty[];
    cards: DetectedCard[];
  }) => {
    const importResult = await pipeline.executeImport(adjusted);
    if (importResult) setStep("result");
  };

  const handleGoToProject = async (projectId: string) => {
    await selectProject(projectId);
    handleClose(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        inset
        className="w-3/5 flex flex-col overflow-hidden"
      >
        <SheetHeader>
          <SheetTitle>{STEP_TITLES[step]}</SheetTitle>
          {STEP_DESCRIPTIONS[step] && (
            <SheetDescription>{STEP_DESCRIPTIONS[step]}</SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-auto px-6 pb-6">
          {step === "upload" && (
            <UploadStep onFileParsed={handleFileParsed} log={log} />
          )}
          {step === "analysis" && parsedFile && (
            <AnalysisStep
              parsedFile={parsedFile}
              onAnalysisComplete={handleAnalysisComplete}
              onBack={() => setStep("upload")}
              log={log}
            />
          )}
          {step === "review" && analysis && (
            <ReviewStep
              analysis={analysis}
              onConfirm={handleConfirm}
              onBack={() => setStep("analysis")}
              importing={pipeline.importing}
            />
          )}
          {step === "result" && pipeline.result && (
            <ResultStep
              result={pipeline.result}
              onClose={() => handleClose(false)}
              onGoToProject={handleGoToProject}
            />
          )}

          <PipelinePanel steps={log.steps} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
