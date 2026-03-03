"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VersionReasonBadge } from "./version-reason-badge";
import { SaveSnapshotPopover } from "./save-snapshot-popover";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";
import { IconFilter, IconHistory } from "@tabler/icons-react";
import type { VersionReason } from "@/lib/types";

export interface VersionEntry {
  id: string;
  version_number: number;
  reason: VersionReason | null;
  label: string | null;
  created_at: string;
}

interface VersionHistoryListProps {
  versions: VersionEntry[];
  isLoading: boolean;
  selectedVersionId: string | null;
  onSelectVersion: (version: VersionEntry) => void;
  onSaveSnapshot: (label?: string) => Promise<void>;
  onRestore: (version: VersionEntry) => Promise<void>;
}

const ALL_REASONS: { value: VersionReason; label: string }[] = [
  { value: "manual", label: "Snapshots" },
  { value: "status_change", label: "Status changes" },
  { value: "pre_import", label: "Pre-import" },
  { value: "pre_restore", label: "Pre-restore" },
  { value: "pre_ai_edit", label: "Pre-AI edit" },
  { value: "periodic_auto_save", label: "Auto-saves" },
];

export function VersionHistoryList({
  versions,
  isLoading,
  selectedVersionId,
  onSelectVersion,
  onSaveSnapshot,
  onRestore,
}: VersionHistoryListProps) {
  const [reasonFilters, setReasonFilters] = useState<Set<VersionReason>>(
    new Set(["manual"])
  );
  const [showAll, setShowAll] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleReason = useCallback((reason: VersionReason) => {
    setReasonFilters((prev) => {
      const next = new Set(prev);
      if (next.has(reason)) next.delete(reason);
      else next.add(reason);
      return next;
    });
    setShowAll(false);
  }, []);

  const toggleAll = useCallback(() => {
    setShowAll((prev) => {
      if (!prev) {
        setReasonFilters(new Set());
        return true;
      }
      setReasonFilters(new Set(["manual"]));
      return false;
    });
  }, []);

  const filtered = showAll
    ? versions
    : versions.filter((v) => v.reason !== null && reasonFilters.has(v.reason));

  const activeCount = showAll ? 0 : reasonFilters.size;

  const handleRestore = async (version: VersionEntry) => {
    setRestoring(true);
    try {
      await onRestore(version);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <SaveSnapshotPopover onSave={onSaveSnapshot} />
        <div className="flex-1" />
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <IconFilter size={14} />
                Filter
                {activeCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                    {activeCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter versions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showAll}
                onCheckedChange={toggleAll}
                onSelect={(e) => e.preventDefault()}
              >
                All versions
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {ALL_REASONS.map((r) => (
                <DropdownMenuCheckboxItem
                  key={r.value}
                  checked={!showAll && reasonFilters.has(r.value)}
                  disabled={showAll}
                  onCheckedChange={() => toggleReason(r.value)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {r.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Version list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading versions…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <IconHistory size={24} className="opacity-50" />
            <p>
              {!showAll && reasonFilters.size === 1 && reasonFilters.has("manual")
                ? "No snapshots yet"
                : "No versions match this filter"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((version) => {
              const isSelected = version.id === selectedVersionId;
              return (
                <div
                  key={version.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectVersion(version)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectVersion(version);
                    }
                  }}
                  className={`group flex flex-col gap-1 border-b border-border/50 px-3 py-2.5 text-left transition-colors hover:bg-muted/40 ${
                    isSelected ? "bg-muted/60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      v{version.version_number}
                    </span>
                    <VersionReasonBadge reason={version.reason} />
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {formatRelativeTime(version.created_at)}
                    </span>
                  </div>
                  {version.label && (
                    <p className="truncate text-sm">{version.label}</p>
                  )}
                  {isSelected && (
                    <div className="mt-1">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={restoring}
                          >
                            {restoring ? "Restoring…" : "Restore this version"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Restore version?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will overwrite the current state with version{" "}
                              {version.version_number}. A backup snapshot will be
                              created automatically before restoring.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRestore(version)}
                            >
                              Restore
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
