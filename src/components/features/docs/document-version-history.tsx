"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import {
  VersionHistoryList,
  type VersionEntry,
} from "@/components/features/versions/version-history-list";
import { VersionReasonBadge } from "@/components/features/versions/version-reason-badge";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";
import {
  getDocumentVersions,
  createDocumentSnapshot,
  restoreDocumentVersion,
} from "@/lib/actions/versions";
import { createEditorExtensions } from "./tiptap-setup";
import type { Document, DocumentVersion } from "@/lib/types";
import { toast } from "sonner";

interface DocumentVersionHistoryProps {
  document: Document;
  onRestored: (doc: Document) => void;
  onBack: () => void;
}

export function DocumentVersionHistory({
  document,
  onRestored,
  onBack,
}: DocumentVersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] =
    useState<DocumentVersion | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: createEditorExtensions(),
    content: { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: { class: "outline-none min-h-[200px]" },
    },
  });

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    const result = await getDocumentVersions(document.id);
    if (result.success) {
      setVersions(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, [document.id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadVersions(); }, [loadVersions]);

  // Update preview when selected version changes
  useEffect(() => {
    if (!editor || !selectedVersion) return;
    const content = selectedVersion.content as Record<string, unknown> | null;
    if (content && content.type) {
      editor.commands.setContent(content);
    } else {
      editor.commands.setContent({ type: "doc", content: [{ type: "paragraph" }] });
    }
  }, [editor, selectedVersion]);

  const handleSelectVersion = useCallback(
    (entry: VersionEntry) => {
      const version = versions.find((v) => v.id === entry.id) ?? null;
      setSelectedVersion(version);
    },
    [versions]
  );

  const handleSaveSnapshot = useCallback(
    async (label?: string) => {
      const result = await createDocumentSnapshot(document.id, { label });
      if (result.success) {
        toast.success("Snapshot saved");
        await loadVersions();
      } else {
        toast.error(result.error);
      }
    },
    [document.id, loadVersions]
  );

  const handleRestore = useCallback(
    async (entry: VersionEntry) => {
      const result = await restoreDocumentVersion(
        document.id,
        entry.version_number
      );
      if (result.success) {
        toast.success(`Restored to v${entry.version_number}`);
        onRestored(result.data);
      } else {
        toast.error(result.error);
      }
    },
    [document.id, onRestored]
  );

  const versionEntries: VersionEntry[] = versions.map((v) => ({
    id: v.id,
    version_number: v.version_number,
    reason: v.reason,
    label: v.label,
    created_at: v.created_at,
  }));

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={onBack}
        >
          <IconArrowLeft size={16} />
        </Button>
        <span className="min-w-0 truncate text-sm font-medium">
          Version history — {document.title}
        </span>
      </div>

      {/* Split: preview + list */}
      <div className="flex min-h-0 flex-1">
        {/* Read-only preview */}
        <div className="flex min-w-0 flex-1 flex-col border-r border-border">
          {selectedVersion && (
            <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                v{selectedVersion.version_number}
              </span>
              <VersionReasonBadge reason={selectedVersion.reason} />
              {selectedVersion.label && (
                <span className="truncate text-sm">{selectedVersion.label}</span>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {formatRelativeTime(selectedVersion.created_at)}
              </span>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {selectedVersion ? (
              <div className="prose prose-sm dark:prose-invert mx-auto max-w-2xl">
                <EditorContent editor={editor} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select a version to preview
              </div>
            )}
          </div>
        </div>

        {/* Version list */}
        <div className="w-72 shrink-0">
          <VersionHistoryList
            versions={versionEntries}
            isLoading={isLoading}
            selectedVersionId={selectedVersion?.id ?? null}
            onSelectVersion={handleSelectVersion}
            onSaveSnapshot={handleSaveSnapshot}
            onRestore={handleRestore}
          />
        </div>
      </div>
    </div>
  );
}
