"use client";

import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCardsStore } from "@/lib/store/cards-store";
import type { Property, PropertyType } from "@/lib/types";
import {
  IconTypography,
  IconHash,
  IconPhoto,
  IconList,
  IconToggleLeft,
  IconPalette,
  IconTrash,
  IconPencil,
  IconArrowLeft,
  IconArrowRight,
  IconPlus,
  IconX,
} from "@tabler/icons-react";

const TYPE_OPTIONS: { value: PropertyType; label: string; icon: React.ReactNode }[] = [
  { value: "text", label: "Text", icon: <IconTypography size={14} /> },
  { value: "number", label: "Number", icon: <IconHash size={14} /> },
  { value: "image", label: "Image", icon: <IconPhoto size={14} /> },
  { value: "select", label: "Select", icon: <IconList size={14} /> },
  { value: "boolean", label: "Boolean", icon: <IconToggleLeft size={14} /> },
  { value: "color", label: "Color", icon: <IconPalette size={14} /> },
];

interface PropertyContextMenuProps {
  property: Property;
  children: React.ReactNode;
}

export function PropertyContextMenu({
  property,
  children,
}: PropertyContextMenuProps) {
  const { properties, updateProperty, deleteProperty, moveProperty } =
    useCardsStore();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(property.name);
  const [editType, setEditType] = useState<PropertyType>(property.type);
  const [editOptions, setEditOptions] = useState<string[]>(() => {
    const opts = property.options;
    return Array.isArray(opts) && opts.length > 0
      ? (opts as string[])
      : [""];
  });
  const [editRequired, setEditRequired] = useState(property.is_required ?? false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const sorted = [...properties].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const sortedIndex = sorted.findIndex((p) => p.id === property.id);
  const canMoveLeft = sortedIndex > 0;
  const canMoveRight = sortedIndex < sorted.length - 1;

  const openEditDialog = () => {
    setEditName(property.name);
    setEditType(property.type);
    const opts = property.options;
    setEditOptions(
      Array.isArray(opts) && opts.length > 0 ? (opts as string[]) : [""]
    );
    setEditRequired(property.is_required ?? false);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editName.trim()) return;
    const cleanOptions =
      editType === "select"
        ? editOptions.map((o) => o.trim()).filter(Boolean)
        : undefined;
    if (editType === "select" && (!cleanOptions || cleanOptions.length === 0))
      return;

    const updates: {
      name?: string;
      type?: PropertyType;
      options?: string[];
      is_required?: boolean;
    } = {};

    if (editName.trim() !== property.name) updates.name = editName.trim();
    if (editType !== property.type) updates.type = editType;
    if (editType === "select") updates.options = cleanOptions;
    if (editRequired !== (property.is_required ?? false))
      updates.is_required = editRequired;

    if (Object.keys(updates).length > 0) {
      updateProperty(property.id, updates);
    }
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteProperty(property.id);
    setDeleteOpen(false);
  };

  const addOption = () => setEditOptions((prev) => [...prev, ""]);
  const removeOption = (index: number) =>
    setEditOptions((prev) => prev.filter((_, i) => i !== index));
  const updateOption = (index: number, value: string) =>
    setEditOptions((prev) => prev.map((o, i) => (i === index ? value : o)));

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={openEditDialog}>
            <IconPencil size={14} className="mr-2" />
            Edit Column
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => moveProperty(property.id, "left")}
            disabled={!canMoveLeft}
          >
            <IconArrowLeft size={14} className="mr-2" />
            Move Left
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => moveProperty(property.id, "right")}
            disabled={!canMoveRight}
          >
            <IconArrowRight size={14} className="mr-2" />
            Move Right
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash size={14} className="mr-2" />
            Delete Column
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Edit Column Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSave();
                }}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Type</label>
              <Select
                value={editType}
                onValueChange={(v) => {
                  setEditType(v as PropertyType);
                  if (v !== "select") setEditOptions([""]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        {opt.icon}
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editType === "select" && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Options</label>
                {editOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Input
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (opt.trim()) addOption();
                        }
                      }}
                      className="h-7 text-xs"
                    />
                    {editOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <IconX size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <IconPlus size={12} />
                  Add option
                </button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <label htmlFor="edit-col-required" className="text-xs text-muted-foreground">
                Required
              </label>
              <Switch
                id="edit-col-required"
                checked={editRequired}
                onCheckedChange={setEditRequired}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={
                !editName.trim() ||
                (editType === "select" &&
                  editOptions.every((o) => !o.trim()))
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{property.name}&rdquo;?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove the column and its data from all cards. This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
