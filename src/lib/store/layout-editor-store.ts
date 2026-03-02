import { create } from "zustand";
import type { Layout } from "@/lib/types";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Json } from "@/lib/supabase/database.types";
import * as layoutActions from "@/lib/actions/layouts";
import { toast } from "sonner";

const MAX_HISTORY = 100;

interface LayoutEditorState {
  // Data
  layouts: Layout[];
  currentLayoutId: string | null;
  elements: CanvasElement[];
  isDirty: boolean;
  selectedElementIds: Set<string>;
  previewCardIndex: number; // -1 = no preview
  isSaving: boolean;

  // Clipboard (internal, not persisted)
  clipboard: CanvasElement[];

  // Undo/redo
  history: CanvasElement[][];
  future: CanvasElement[][];
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Layout CRUD
  loadLayouts: (projectId: string) => Promise<void>;
  selectLayout: (layoutId: string | null) => void;
  createLayout: (input: {
    project_id: string;
    name: string;
    width?: number;
    height?: number;
  }) => Promise<Layout | null>;
  deleteLayout: (layoutId: string) => Promise<void>;

  // Selection
  selectElement: (id: string | null, additive?: boolean) => void;
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;

  // Element mutations
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, partial: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  moveElement: (id: string, x: number, y: number) => void;
  moveSelectedElements: (dx: number, dy: number) => void;
  resizeElement: (id: string, w: number, h: number) => void;
  reorderElement: (id: string, direction: "up" | "down") => void;

  // Clipboard operations
  duplicateSelectedElements: () => void;
  copySelectedElements: () => void;
  cutSelectedElements: () => void;
  pasteElements: () => void;

  // Alignment & distribution
  alignElements: (axis: "left" | "center-h" | "right" | "top" | "center-v" | "bottom") => void;
  distributeElements: (axis: "horizontal" | "vertical") => void;

  // Persistence
  saveElements: () => Promise<void>;

  // Layout updates
  updateLayoutDimensions: (
    layoutId: string,
    width: number,
    height: number
  ) => Promise<void>;
  updateLayoutCondition: (
    layoutId: string,
    condition: Json | null
  ) => Promise<void>;

  // Preview
  setPreviewCardIndex: (index: number) => void;
}

/** Push current elements onto undo stack, clear redo */
function pushHistory(state: LayoutEditorState) {
  return {
    history: [...state.history, state.elements].slice(-MAX_HISTORY),
    future: [] as CanvasElement[][],
  };
}

export const useLayoutEditorStore = create<LayoutEditorState>((set, get) => ({
  layouts: [],
  currentLayoutId: null,
  elements: [],
  isDirty: false,
  selectedElementIds: new Set<string>(),
  previewCardIndex: -1,
  isSaving: false,
  clipboard: [],
  history: [],
  future: [],

  undo: () => {
    const { history, elements } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set({
      elements: previous,
      history: history.slice(0, -1),
      future: [elements, ...get().future],
      isDirty: true,
    });
  },

  redo: () => {
    const { future, elements } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      elements: next,
      future: future.slice(1),
      history: [...get().history, elements],
      isDirty: true,
    });
  },

  canUndo: () => get().history.length > 0,
  canRedo: () => get().future.length > 0,

  loadLayouts: async (projectId) => {
    const result = await layoutActions.getLayouts(projectId);
    if (result.success) {
      set({ layouts: result.data });
    } else {
      toast.error(result.error);
    }
  },

  selectLayout: (layoutId) => {
    if (!layoutId) {
      set({
        currentLayoutId: null,
        elements: [],
        isDirty: false,
        selectedElementIds: new Set(),
        history: [],
        future: [],
      });
      return;
    }

    const layout = get().layouts.find((l) => l.id === layoutId);
    if (!layout) return;

    const elements = Array.isArray(layout.canvas_elements)
      ? (layout.canvas_elements as unknown as CanvasElement[])
      : [];

    set({
      currentLayoutId: layoutId,
      elements,
      isDirty: false,
      selectedElementIds: new Set(),
      history: [],
      future: [],
    });
  },

  createLayout: async (input) => {
    const result = await layoutActions.createLayout(input);
    if (result.success) {
      set((state) => ({ layouts: [...state.layouts, result.data] }));
      return result.data;
    }
    toast.error(result.error);
    return null;
  },

  deleteLayout: async (layoutId) => {
    const result = await layoutActions.deleteLayout(layoutId);
    if (result.success) {
      set((state) => ({
        layouts: state.layouts.filter((l) => l.id !== layoutId),
        currentLayoutId:
          state.currentLayoutId === layoutId ? null : state.currentLayoutId,
        elements: state.currentLayoutId === layoutId ? [] : state.elements,
        isDirty: state.currentLayoutId === layoutId ? false : state.isDirty,
        selectedElementIds:
          state.currentLayoutId === layoutId ? new Set() : state.selectedElementIds,
      }));
    } else {
      toast.error(result.error);
    }
  },

  // Selection
  selectElement: (id, additive) => {
    if (id === null) {
      set({ selectedElementIds: new Set() });
      return;
    }
    if (additive) {
      const current = get().selectedElementIds;
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      set({ selectedElementIds: next });
    } else {
      set({ selectedElementIds: new Set([id]) });
    }
  },

  selectElements: (ids) => {
    set({ selectedElementIds: new Set(ids) });
  },

  clearSelection: () => {
    set({ selectedElementIds: new Set() });
  },

  addElement: (element) => {
    const maxZ = get().elements.reduce(
      (max, el) => Math.max(max, el.z_index),
      -1
    );
    set((state) => ({
      ...pushHistory(state),
      elements: [...state.elements, { ...element, z_index: maxZ + 1 }],
      isDirty: true,
      selectedElementIds: new Set([element.id]),
    }));
  },

  updateElement: (id, partial) => {
    set((state) => ({
      ...pushHistory(state),
      elements: state.elements.map((el) =>
        el.id === id ? ({ ...el, ...partial } as CanvasElement) : el
      ),
      isDirty: true,
    }));
  },

  deleteElement: (id) => {
    set((state) => {
      const next = new Set(state.selectedElementIds);
      next.delete(id);
      return {
        ...pushHistory(state),
        elements: state.elements.filter((el) => el.id !== id),
        isDirty: true,
        selectedElementIds: next,
      };
    });
  },

  deleteSelectedElements: () => {
    const { selectedElementIds } = get();
    if (selectedElementIds.size === 0) return;
    set((state) => ({
      ...pushHistory(state),
      elements: state.elements.filter((el) => !selectedElementIds.has(el.id)),
      isDirty: true,
      selectedElementIds: new Set(),
    }));
  },

  moveElement: (id, x, y) => {
    set((state) => ({
      ...pushHistory(state),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x: Math.round(x), y: Math.round(y) } : el
      ),
      isDirty: true,
    }));
  },

  moveSelectedElements: (dx, dy) => {
    const { selectedElementIds } = get();
    if (selectedElementIds.size === 0) return;
    set((state) => ({
      ...pushHistory(state),
      elements: state.elements.map((el) =>
        selectedElementIds.has(el.id)
          ? { ...el, x: Math.round(el.x + dx), y: Math.round(el.y + dy) }
          : el
      ),
      isDirty: true,
    }));
  },

  resizeElement: (id, w, h) => {
    set((state) => ({
      ...pushHistory(state),
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, width: Math.round(w), height: Math.round(h) }
          : el
      ),
      isDirty: true,
    }));
  },

  reorderElement: (id, direction) => {
    const { elements } = get();
    const sorted = [...elements].sort((a, b) => a.z_index - b.z_index);
    const index = sorted.findIndex((el) => el.id === id);
    if (index < 0) return;

    const swapIndex = direction === "up" ? index + 1 : index - 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const thisZ = sorted[index].z_index;
    const swapZ = sorted[swapIndex].z_index;

    set((state) => ({
      ...pushHistory(state),
      elements: state.elements.map((el) => {
        if (el.id === id) return { ...el, z_index: swapZ };
        if (el.id === sorted[swapIndex].id) return { ...el, z_index: thisZ };
        return el;
      }),
      isDirty: true,
    }));
  },

  // Clipboard operations
  duplicateSelectedElements: () => {
    const { selectedElementIds, elements } = get();
    if (selectedElementIds.size === 0) return;
    const selected = elements.filter((el) => selectedElementIds.has(el.id));
    const maxZ = elements.reduce((max, el) => Math.max(max, el.z_index), -1);
    const duplicated = selected.map((el, i) => ({
      ...el,
      id: crypto.randomUUID(),
      x: el.x + 20,
      y: el.y + 20,
      z_index: maxZ + 1 + i,
    }));
    set((state) => ({
      ...pushHistory(state),
      elements: [...state.elements, ...duplicated],
      isDirty: true,
      selectedElementIds: new Set(duplicated.map((el) => el.id)),
    }));
  },

  copySelectedElements: () => {
    const { selectedElementIds, elements } = get();
    if (selectedElementIds.size === 0) return;
    const selected = elements.filter((el) => selectedElementIds.has(el.id));
    set({ clipboard: selected });
  },

  cutSelectedElements: () => {
    const { selectedElementIds, elements } = get();
    if (selectedElementIds.size === 0) return;
    const selected = elements.filter((el) => selectedElementIds.has(el.id));
    set((state) => ({
      ...pushHistory(state),
      clipboard: selected,
      elements: state.elements.filter((el) => !selectedElementIds.has(el.id)),
      isDirty: true,
      selectedElementIds: new Set(),
    }));
  },

  pasteElements: () => {
    const { clipboard, elements } = get();
    if (clipboard.length === 0) return;
    const maxZ = elements.reduce((max, el) => Math.max(max, el.z_index), -1);
    const pasted = clipboard.map((el, i) => ({
      ...el,
      id: crypto.randomUUID(),
      x: el.x + 20,
      y: el.y + 20,
      z_index: maxZ + 1 + i,
    }));
    set((state) => ({
      ...pushHistory(state),
      elements: [...state.elements, ...pasted],
      isDirty: true,
      selectedElementIds: new Set(pasted.map((el) => el.id)),
    }));
  },

  // Alignment & distribution
  alignElements: (axis) => {
    const { selectedElementIds, elements } = get();
    if (selectedElementIds.size < 2) return;
    const selected = elements.filter((el) => selectedElementIds.has(el.id));

    let updater: (el: CanvasElement) => CanvasElement;

    switch (axis) {
      case "left": {
        const minX = Math.min(...selected.map((el) => el.x));
        updater = (el) => ({ ...el, x: minX });
        break;
      }
      case "center-h": {
        const centers = selected.map((el) => el.x + el.width / 2);
        const avg = centers.reduce((a, b) => a + b, 0) / centers.length;
        updater = (el) => ({ ...el, x: Math.round(avg - el.width / 2) });
        break;
      }
      case "right": {
        const maxRight = Math.max(...selected.map((el) => el.x + el.width));
        updater = (el) => ({ ...el, x: maxRight - el.width });
        break;
      }
      case "top": {
        const minY = Math.min(...selected.map((el) => el.y));
        updater = (el) => ({ ...el, y: minY });
        break;
      }
      case "center-v": {
        const centers = selected.map((el) => el.y + el.height / 2);
        const avg = centers.reduce((a, b) => a + b, 0) / centers.length;
        updater = (el) => ({ ...el, y: Math.round(avg - el.height / 2) });
        break;
      }
      case "bottom": {
        const maxBottom = Math.max(...selected.map((el) => el.y + el.height));
        updater = (el) => ({ ...el, y: maxBottom - el.height });
        break;
      }
    }

    set((state) => ({
      ...pushHistory(state),
      elements: state.elements.map((el) =>
        selectedElementIds.has(el.id) ? updater(el) : el
      ),
      isDirty: true,
    }));
  },

  distributeElements: (axis) => {
    const { selectedElementIds, elements } = get();
    if (selectedElementIds.size < 3) return;
    const selected = elements
      .filter((el) => selectedElementIds.has(el.id))
      .sort((a, b) =>
        axis === "horizontal" ? a.x - b.x : a.y - b.y
      );

    const idToPos = new Map<string, { x: number; y: number }>();

    if (axis === "horizontal") {
      const first = selected[0];
      const last = selected[selected.length - 1];
      const totalSpan = (last.x + last.width) - first.x;
      const totalElemWidth = selected.reduce((sum, el) => sum + el.width, 0);
      const gap = (totalSpan - totalElemWidth) / (selected.length - 1);
      let cursor = first.x;
      for (const el of selected) {
        idToPos.set(el.id, { x: Math.round(cursor), y: el.y });
        cursor += el.width + gap;
      }
    } else {
      const first = selected[0];
      const last = selected[selected.length - 1];
      const totalSpan = (last.y + last.height) - first.y;
      const totalElemHeight = selected.reduce((sum, el) => sum + el.height, 0);
      const gap = (totalSpan - totalElemHeight) / (selected.length - 1);
      let cursor = first.y;
      for (const el of selected) {
        idToPos.set(el.id, { x: el.x, y: Math.round(cursor) });
        cursor += el.height + gap;
      }
    }

    set((state) => ({
      ...pushHistory(state),
      elements: state.elements.map((el) => {
        const pos = idToPos.get(el.id);
        return pos ? { ...el, ...pos } : el;
      }),
      isDirty: true,
    }));
  },

  saveElements: async () => {
    const { currentLayoutId, elements } = get();
    if (!currentLayoutId) return;

    set({ isSaving: true });
    const result = await layoutActions.saveCanvasElements(
      currentLayoutId,
      elements
    );

    if (result.success) {
      set((state) => ({
        layouts: state.layouts.map((l) =>
          l.id === currentLayoutId
            ? { ...l, canvas_elements: elements as unknown as Layout["canvas_elements"] }
            : l
        ),
        isDirty: false,
        isSaving: false,
      }));
      toast.success("Layout saved");
    } else {
      set({ isSaving: false });
      toast.error(result.error);
    }
  },

  updateLayoutDimensions: async (layoutId, width, height) => {
    const result = await layoutActions.updateLayout(layoutId, { width, height });
    if (result.success) {
      set((state) => ({
        layouts: state.layouts.map((l) =>
          l.id === layoutId ? { ...l, width, height } : l
        ),
      }));
    } else {
      toast.error(result.error);
    }
  },

  updateLayoutCondition: async (layoutId, condition) => {
    const result = await layoutActions.updateLayout(layoutId, { condition });
    if (result.success) {
      set((state) => ({
        layouts: state.layouts.map((l) =>
          l.id === layoutId ? { ...l, condition } : l
        ),
      }));
    } else {
      toast.error(result.error);
    }
  },

  setPreviewCardIndex: (index) => {
    set({ previewCardIndex: index });
  },
}));
