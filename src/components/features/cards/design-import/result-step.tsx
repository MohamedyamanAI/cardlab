"use client";

import { Button } from "@/components/ui/button";
import { IconCheck, IconAlertTriangle, IconArrowRight } from "@tabler/icons-react";
import type { DesignImportResult } from "@/lib/types/design-import";

interface ResultStepProps {
  result: DesignImportResult;
  onClose: () => void;
  onGoToProject: (projectId: string) => void;
}

export function ResultStep({ result, onClose, onGoToProject }: ResultStepProps) {
  const hasErrors = result.errors.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center py-4">
        {hasErrors ? (
          <IconAlertTriangle size={40} className="text-yellow-500" />
        ) : (
          <IconCheck size={40} className="text-green-500" />
        )}
        <p className="mt-3 text-lg font-medium">
          {result.projectName}
        </p>
        <p className="text-sm text-muted-foreground">
          Design imported successfully
        </p>
      </div>

      <div className="rounded-lg border p-3 text-sm space-y-1">
        <p>
          <span className="text-muted-foreground">Properties created:</span>{" "}
          {result.propertiesCreated}
        </p>
        <p>
          <span className="text-muted-foreground">Layout created:</span>{" "}
          {result.layoutCreated ? "Yes" : "No"}
        </p>
        <p>
          <span className="text-muted-foreground">Cards created:</span>{" "}
          {result.cardsCreated}
        </p>
        <p>
          <span className="text-muted-foreground">Images uploaded:</span>{" "}
          {result.mediaUploaded}
        </p>
      </div>

      {hasErrors && (
        <div className="max-h-32 overflow-auto rounded border p-3">
          <p className="mb-1 text-xs font-medium text-destructive">
            Warnings ({result.errors.length})
          </p>
          {result.errors.map((err, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              {err.step}: {err.message}
            </p>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => onGoToProject(result.projectId)}>
          Open Project
          <IconArrowRight size={14} className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
