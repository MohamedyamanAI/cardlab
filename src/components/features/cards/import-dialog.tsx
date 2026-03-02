"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCardsStore } from "@/lib/store/cards-store";
import type {
  ParsedImportData,
  ImportColumn,
  ColumnMapping,
  ImportResult,
} from "@/lib/types/import";
import type { Property } from "@/lib/types";
import { ImportSourceStep } from "./import-steps/source-step";
import { ImportMappingStep } from "./import-steps/mapping-step";
import { ImportTargetStep } from "./import-steps/target-step";
import { ImportResultStep } from "./import-steps/result-step";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WizardStep = "source" | "mapping" | "target" | "result";

const STEP_TITLES: Record<WizardStep, string> = {
  source: "Import Cards",
  mapping: "Map Columns",
  target: "Choose Destination",
  result: "Import Complete",
};

const STEP_DESCRIPTIONS: Record<WizardStep, string> = {
  source: "Upload a file or paste data to import cards.",
  mapping: "Click a row number to set it as the header row, then map columns.",
  target: "Choose where to import your cards.",
  result: "",
};

/** Build default column mappings by auto-matching column names to existing properties */
export function buildDefaultMappings(
  columns: ImportColumn[],
  existingProperties: Property[]
): ColumnMapping[] {
  return columns.map((col) => {
    const match = existingProperties.find(
      (p) =>
        p.name.toLowerCase() === col.name.toLowerCase() ||
        p.slug === col.name.toLowerCase().replace(/\s+/g, "-")
    );
    if (match) {
      return {
        sourceIndex: col.index,
        action: "map_existing" as const,
        existingPropertySlug: match.slug,
      };
    }
    return {
      sourceIndex: col.index,
      action: "create_new" as const,
      newPropertyName: col.name,
      newPropertyType: col.inferredType,
    };
  });
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [step, setStep] = useState<WizardStep>("source");
  const [parsedData, setParsedData] = useState<ParsedImportData | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const { selectedProjectId, properties, importCards } = useCardsStore();

  const reset = useCallback(() => {
    setStep("source");
    setParsedData(null);
    setMappings([]);
    setDataRows([]);
    setResult(null);
    setIsImporting(false);
  }, []);

  const handleClose = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  // Step 1 -> Step 2
  const handleDataParsed = (data: ParsedImportData) => {
    setParsedData(data);
    setDataRows(data.rows);
    setMappings(buildDefaultMappings(data.columns, properties));
    setStep("mapping");
  };

  // Step 2 -> Step 3
  const handleMappingConfirmed = (
    confirmedMappings: ColumnMapping[],
    effectiveRows: string[][]
  ) => {
    setMappings(confirmedMappings);
    setDataRows(effectiveRows);
    setStep("target");
  };

  // Step 3 -> Step 4
  const handleImport = async (targetProjectId: string) => {
    if (!parsedData) return;
    setIsImporting(true);
    const importResult = await importCards({
      project_id: targetProjectId,
      mappings,
      rows: dataRows,
    });
    setIsImporting(false);
    if (importResult) {
      setResult(importResult);
      setStep("result");
    }
  };

  const isMappingStep = step === "mapping";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={
          isMappingStep
            ? "sm:max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            : "sm:max-w-2xl"
        }
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{STEP_TITLES[step]}</DialogTitle>
          {STEP_DESCRIPTIONS[step] && (
            <DialogDescription>{STEP_DESCRIPTIONS[step]}</DialogDescription>
          )}
        </DialogHeader>

        {step === "source" && (
          <ImportSourceStep onDataParsed={handleDataParsed} />
        )}
        {step === "mapping" && parsedData && (
          <ImportMappingStep
            parsedData={parsedData}
            mappings={mappings}
            existingProperties={properties}
            onConfirm={handleMappingConfirmed}
            onBack={() => setStep("source")}
          />
        )}
        {step === "target" && parsedData && (
          <ImportTargetStep
            parsedData={{ ...parsedData, rows: dataRows }}
            mappings={mappings}
            currentProjectId={selectedProjectId}
            isImporting={isImporting}
            onImport={handleImport}
            onBack={() => setStep("mapping")}
          />
        )}
        {step === "result" && result && (
          <ImportResultStep
            result={result}
            onClose={() => handleClose(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
