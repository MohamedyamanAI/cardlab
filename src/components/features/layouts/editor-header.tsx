"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { CreateLayoutDialog } from "./create-layout-dialog";
import { IconPlus, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";

export function EditorHeader() {
  const [showCreate, setShowCreate] = useState(false);
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);
  const isDirty = useLayoutEditorStore((s) => s.isDirty);
  const isSaving = useLayoutEditorStore((s) => s.isSaving);
  const selectLayout = useLayoutEditorStore((s) => s.selectLayout);
  const saveElements = useLayoutEditorStore((s) => s.saveElements);
  const deleteLayout = useLayoutEditorStore((s) => s.deleteLayout);

  return (
    <div className="flex items-center gap-2 border-b px-4 py-2">
      <Select
        value={currentLayoutId ?? "__none__"}
        onValueChange={(val) => selectLayout(val === "__none__" ? null : val)}
      >
        <SelectTrigger className="h-8 w-48 text-sm">
          <SelectValue placeholder="Select layout..." />
        </SelectTrigger>
        <SelectContent>
          {layouts.length === 0 && (
            <SelectItem value="__none__" disabled>
              No layouts
            </SelectItem>
          )}
          {layouts.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCreate(true)}
      >
        <IconPlus className="size-4" />
        New
      </Button>

      {currentLayoutId && (
        <>
          <div className="flex-1" />
          {isDirty && (
            <span className="text-xs text-amber-500">Unsaved changes</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={saveElements}
            disabled={!isDirty || isSaving}
          >
            <IconDeviceFloppy className="size-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Delete this layout?")) {
                deleteLayout(currentLayoutId);
              }
            }}
          >
            <IconTrash className="size-4" />
          </Button>
        </>
      )}

      <CreateLayoutDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
