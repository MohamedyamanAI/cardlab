"use client";

import { Button } from "@/components/ui/button";
import { IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import type { ImportResult } from "@/lib/types/import";

interface ResultStepProps {
  result: ImportResult;
  onClose: () => void;
}

export function ImportResultStep({ result, onClose }: ResultStepProps) {
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
          {result.importedCount} cards imported
        </p>
        {result.skippedCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {result.skippedCount} empty rows skipped
          </p>
        )}
        {result.createdProperties.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {result.createdProperties.length} new properties created:{" "}
            {result.createdProperties.join(", ")}
          </p>
        )}
      </div>

      {hasErrors && (
        <div className="max-h-32 overflow-auto rounded border p-3">
          <p className="mb-1 text-xs font-medium text-destructive">
            Row errors ({result.errors.length})
          </p>
          {result.errors.slice(0, 20).map((err, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              Row {err.row}: {err.message}
            </p>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
