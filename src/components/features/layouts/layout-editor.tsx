"use client";

import { useEffect, useCallback } from "react";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { EditorHeader } from "./editor-header";
import { ElementsPanel } from "./elements-panel";
import { CanvasViewport } from "./canvas-viewport";
import { PropertiesPanel } from "./properties-panel";
import { CardPreviewBar } from "./card-preview-bar";

export function LayoutEditor() {
  const selectedProjectId = useCardsStore((s) => s.selectedProjectId);
  const loadLayouts = useLayoutEditorStore((s) => s.loadLayouts);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);
  const isDirty = useLayoutEditorStore((s) => s.isDirty);
  const saveElements = useLayoutEditorStore((s) => s.saveElements);
  const selectedElementId = useLayoutEditorStore((s) => s.selectedElementId);
  const selectElement = useLayoutEditorStore((s) => s.selectElement);
  const deleteElement = useLayoutEditorStore((s) => s.deleteElement);
  const moveElement = useLayoutEditorStore((s) => s.moveElement);
  const elements = useLayoutEditorStore((s) => s.elements);
  const undo = useLayoutEditorStore((s) => s.undo);
  const redo = useLayoutEditorStore((s) => s.redo);

  useEffect(() => {
    if (selectedProjectId) {
      loadLayouts(selectedProjectId);
    }
  }, [selectedProjectId, loadLayouts]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      // Cmd/Ctrl+S → save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty) saveElements();
        return;
      }

      // Cmd/Ctrl+Z → undo, Cmd/Ctrl+Shift+Z → redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isInput) return;

      // Escape → deselect
      if (e.key === "Escape") {
        selectElement(null);
        return;
      }

      // Delete/Backspace → delete selected
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElementId
      ) {
        e.preventDefault();
        deleteElement(selectedElementId);
        return;
      }

      // Arrow keys → nudge
      if (selectedElementId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const el = elements.find((el) => el.id === selectedElementId);
        if (!el) return;
        const step = e.shiftKey ? 10 : 1;
        let { x, y } = el;
        if (e.key === "ArrowUp") y -= step;
        if (e.key === "ArrowDown") y += step;
        if (e.key === "ArrowLeft") x -= step;
        if (e.key === "ArrowRight") x += step;
        moveElement(selectedElementId, x, y);
      }
    },
    [isDirty, saveElements, selectElement, selectedElementId, deleteElement, moveElement, elements, undo, redo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  if (!selectedProjectId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a project to manage layouts.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      <EditorHeader />
      <div className="flex flex-1 overflow-hidden">
        {currentLayoutId && <ElementsPanel />}
        <CanvasViewport />
        {currentLayoutId && <PropertiesPanel />}
      </div>
      {currentLayoutId && <CardPreviewBar />}
    </div>
  );
}
