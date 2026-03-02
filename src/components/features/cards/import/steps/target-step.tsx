"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCardsStore } from "@/lib/store/cards-store";
import type { ParsedImportData, ColumnMapping } from "@/lib/types/import";

interface TargetStepProps {
  parsedData: ParsedImportData;
  mappings: ColumnMapping[];
  currentProjectId: string | null;
  isImporting: boolean;
  onImport: (projectId: string) => void;
  onBack: () => void;
}

export function ImportTargetStep({
  parsedData,
  mappings,
  currentProjectId,
  isImporting,
  onImport,
  onBack,
}: TargetStepProps) {
  const { projects, createProject } = useCardsStore();
  const [target, setTarget] = useState<"current" | "new">(
    currentProjectId ? "current" : "new"
  );
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const activeMappings = mappings.filter((m) => m.action !== "skip");
  const newProperties = activeMappings.filter(
    (m) => m.action === "create_new"
  );

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const handleImport = async () => {
    if (target === "current" && currentProjectId) {
      onImport(currentProjectId);
    } else if (target === "new" && newProjectName.trim()) {
      setIsCreating(true);
      const project = await createProject({ name: newProjectName.trim() });
      setIsCreating(false);
      if (project) {
        onImport(project.id);
      }
    }
  };

  const busy = isImporting || isCreating;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {currentProjectId && (
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="radio"
              name="target"
              checked={target === "current"}
              onChange={() => setTarget("current")}
              className="accent-primary"
            />
            <div>
              <p className="text-sm font-medium">Current project</p>
              <p className="text-xs text-muted-foreground">
                Add to &ldquo;{currentProject?.name}&rdquo;
              </p>
            </div>
          </label>
        )}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="radio"
            name="target"
            checked={target === "new"}
            onChange={() => setTarget("new")}
            className="accent-primary"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">New project</p>
            {target === "new" && (
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="mt-2"
                autoFocus
              />
            )}
          </div>
        </label>
      </div>

      <div className="space-y-1 rounded-lg bg-muted/50 p-4">
        <p className="text-sm font-medium">Import Summary</p>
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          <li>{parsedData.rows.length} cards will be imported</li>
          <li>{activeMappings.length} columns mapped</li>
          {newProperties.length > 0 && (
            <li>{newProperties.length} new properties will be created</li>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button
          onClick={handleImport}
          disabled={
            busy ||
            (target === "new" && !newProjectName.trim()) ||
            (target === "current" && !currentProjectId)
          }
        >
          {busy ? "Importing..." : "Import Cards"}
        </Button>
      </div>
    </div>
  );
}
