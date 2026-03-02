"use client";

import { useEffect, useCallback } from "react";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { useCardsStore } from "@/lib/store/cards-store";
import { EditorHeader } from "./editor-header";
import { ElementsPanel } from "./elements-panel";
import { CanvasViewport } from "./canvas-viewport";
import { PropertiesPanel } from "./properties-panel";

export function LayoutEditor() {
  const selectedProjectId = useCardsStore((s) => s.selectedProjectId);
  const loadLayouts = useLayoutEditorStore((s) => s.loadLayouts);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);
  const isDirty = useLayoutEditorStore((s) => s.isDirty);
  const saveElements = useLayoutEditorStore((s) => s.saveElements);
  const selectedElementIds = useLayoutEditorStore((s) => s.selectedElementIds);
  const clearSelection = useLayoutEditorStore((s) => s.clearSelection);
  const deleteSelectedElements = useLayoutEditorStore((s) => s.deleteSelectedElements);
  const moveSelectedElements = useLayoutEditorStore((s) => s.moveSelectedElements);
  const duplicateSelectedElements = useLayoutEditorStore((s) => s.duplicateSelectedElements);
  const copySelectedElements = useLayoutEditorStore((s) => s.copySelectedElements);
  const cutSelectedElements = useLayoutEditorStore((s) => s.cutSelectedElements);
  const pasteElements = useLayoutEditorStore((s) => s.pasteElements);
  const elements = useLayoutEditorStore((s) => s.elements);
  const undo = useLayoutEditorStore((s) => s.undo);
  const redo = useLayoutEditorStore((s) => s.redo);
  const setIsSpaceHeld = useLayoutEditorStore((s) => s.setIsSpaceHeld);

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

      // Cmd/Ctrl+D → duplicate
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        duplicateSelectedElements();
        return;
      }

      // Cmd/Ctrl+C → copy
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && !isInput) {
        e.preventDefault();
        copySelectedElements();
        return;
      }

      // Cmd/Ctrl+X → cut
      if ((e.metaKey || e.ctrlKey) && e.key === "x" && !isInput) {
        e.preventDefault();
        cutSelectedElements();
        return;
      }

      // Cmd/Ctrl+V → paste
      if ((e.metaKey || e.ctrlKey) && e.key === "v" && !isInput) {
        e.preventDefault();
        pasteElements();
        return;
      }

      // Cmd/Ctrl+A → select all
      if ((e.metaKey || e.ctrlKey) && e.key === "a" && !isInput) {
        e.preventDefault();
        const store = useLayoutEditorStore.getState();
        store.selectElements(store.elements.map((el) => el.id));
        return;
      }

      if (isInput) return;

      // Space → pan mode
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsSpaceHeld(true);
        return;
      }

      // Escape → deselect
      if (e.key === "Escape") {
        clearSelection();
        return;
      }

      // Delete/Backspace → delete selected
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElementIds.size > 0
      ) {
        e.preventDefault();
        deleteSelectedElements();
        return;
      }

      // Arrow keys → nudge selected
      if (selectedElementIds.size > 0 && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;
        moveSelectedElements(dx, dy);
      }
    },
    [isDirty, saveElements, clearSelection, selectedElementIds, deleteSelectedElements, moveSelectedElements, elements, undo, redo, duplicateSelectedElements, copySelectedElements, cutSelectedElements, pasteElements, setIsSpaceHeld]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        setIsSpaceHeld(false);
      }
    },
    [setIsSpaceHeld]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

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
    </div>
  );
}
