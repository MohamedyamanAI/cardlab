"use client";

import { useState, useEffect, useCallback } from "react";
import {
  VersionHistoryList,
  type VersionEntry,
} from "@/components/features/versions/version-history-list";
import {
  getCardVersions,
  createCardSnapshot,
  restoreCardVersion,
} from "@/lib/actions/versions";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import type { Card, CardVersion } from "@/lib/types";
import type { Json } from "@/lib/supabase/database.types";
import { toast } from "sonner";

interface CardHistoryPanelProps {
  card: Card;
  onRestored: (updated: Card) => void;
  onClose?: () => void;
}

export function CardHistoryPanel({ card, onRestored, onClose }: CardHistoryPanelProps) {
  const [versions, setVersions] = useState<CardVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<CardVersion | null>(
    null
  );

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    const result = await getCardVersions(card.id);
    if (result.success) {
      setVersions(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, [card.id]);

  // biome-ignore lint: fetch on mount
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadVersions(); }, [loadVersions]);

  const handleSelectVersion = useCallback(
    (entry: VersionEntry) => {
      const version = versions.find((v) => v.id === entry.id) ?? null;
      setSelectedVersion(version);
    },
    [versions]
  );

  const handleSaveSnapshot = useCallback(
    async (label?: string) => {
      const result = await createCardSnapshot(card.id, { label });
      if (result.success) {
        toast.success("Snapshot saved");
        await loadVersions();
      } else {
        toast.error(result.error);
      }
    },
    [card.id, loadVersions]
  );

  const handleRestore = useCallback(
    async (entry: VersionEntry) => {
      const result = await restoreCardVersion(card.id, entry.version_number);
      if (result.success) {
        toast.success(`Restored to v${entry.version_number}`);
        onRestored(result.data);
        await loadVersions();
      } else {
        toast.error(result.error);
      }
    },
    [card.id, onRestored, loadVersions]
  );

  const versionEntries: VersionEntry[] = versions.map((v) => ({
    id: v.id,
    version_number: v.version_number,
    reason: v.reason,
    label: v.label,
    created_at: v.created_at,
  }));

  // Parse selected version data for preview
  const versionData =
    selectedVersion?.data && typeof selectedVersion.data === "object"
      ? (selectedVersion.data as Record<string, Json>)
      : null;

  // Derive card display name from first data value
  const cardName =
    card.data && typeof card.data === "object"
      ? String(Object.values(card.data as Record<string, unknown>)[0] ?? "")
      : "";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {cardName || "Card history"}
        </span>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
            <IconX size={14} />
          </Button>
        )}
      </div>
      <VersionHistoryList
        versions={versionEntries}
        isLoading={isLoading}
        selectedVersionId={selectedVersion?.id ?? null}
        onSelectVersion={handleSelectVersion}
        onSaveSnapshot={handleSaveSnapshot}
        onRestore={handleRestore}
      />
      {versionData && (
        <div className="border-t border-border p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Data preview
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            {Object.entries(versionData).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="truncate font-medium text-muted-foreground">
                  {key}
                </dt>
                <dd className="truncate">
                  {value === null ? "—" : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
