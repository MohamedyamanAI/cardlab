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
  selectedElementId: string | null;
  previewCardIndex: number; // -1 = no preview
  isSaving: boolean;

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

  // Element mutations
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, partial: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, w: number, h: number) => void;
  reorderElement: (id: string, direction: "up" | "down") => void;

  // Persistence
  saveElements: () => Promise<void>;

  // Condition
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
  selectedElementId: null,
  previewCardIndex: -1,
  isSaving: false,
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
        selectedElementId: null,
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
      selectedElementId: null,
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
        selectedElementId:
          state.currentLayoutId === layoutId ? null : state.selectedElementId,
      }));
    } else {
      toast.error(result.error);
    }
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
      selectedElementId: element.id,
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
    set((state) => ({
      ...pushHistory(state),
      elements: state.elements.filter((el) => el.id !== id),
      isDirty: true,
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
    }));
  },

  selectElement: (id) => {
    set({ selectedElementId: id });
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

  saveElements: async () => {
    const { currentLayoutId, elements } = get();
    if (!currentLayoutId) return;

    set({ isSaving: true });
    const result = await layoutActions.saveCanvasElements(
      currentLayoutId,
      elements
    );

    if (result.success) {
      // Update the layout in our local list so selectLayout stays in sync
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
