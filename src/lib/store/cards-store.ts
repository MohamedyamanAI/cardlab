import { create } from "zustand";
import type { Project, Property, Card, PropertyType } from "@/lib/types";
import type { Json } from "@/lib/supabase/database.types";
import * as projectActions from "@/lib/actions/projects";
import * as propertyActions from "@/lib/actions/properties";
import * as cardActions from "@/lib/actions/cards";
import { toast } from "sonner";

interface CardsState {
  // Data
  projects: Project[];
  selectedProjectId: string | null;
  properties: Property[];
  cards: Card[];

  // UI State
  isLoading: boolean;
  isInitialized: boolean;
  selectedCardIds: Set<string>;
  editingCell: { cardId: string; slug: string; initialKey?: string } | null;
  focusedCell: { row: number; col: number } | null;

  // Initialization
  hydrate: (initialProjects: Project[]) => void;

  // Project actions
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  createProject: (input: {
    name: string;
    description?: string;
  }) => Promise<Project | null>;

  // Property actions
  addProperty: (input: {
    name: string;
    type: PropertyType;
    options?: string[];
    is_required?: boolean;
  }) => Promise<void>;
  updateProperty: (
    propertyId: string,
    input: {
      name?: string;
      type?: PropertyType;
      options?: string[];
      is_required?: boolean;
    }
  ) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
  moveProperty: (propertyId: string, direction: "left" | "right") => Promise<void>;

  // Card actions
  addCard: () => Promise<void>;
  updateCell: (cardId: string, slug: string, value: unknown) => Promise<void>;
  deleteSelectedCards: () => Promise<void>;
  duplicateSelectedCards: () => Promise<void>;

  // Selection
  toggleCardSelection: (cardId: string) => void;
  selectAllCards: () => void;
  clearSelection: () => void;

  // Cell editing & focus
  startEditing: (cardId: string, slug: string, initialKey?: string) => void;
  stopEditing: () => void;
  setFocusedCell: (row: number, col: number) => void;
  clearFocusedCell: () => void;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  // Initial state
  projects: [],
  selectedProjectId: null,
  properties: [],
  cards: [],
  isLoading: false,
  isInitialized: false,
  selectedCardIds: new Set(),
  editingCell: null,
  focusedCell: null,

  hydrate: (initialProjects) => {
    if (get().isInitialized) return;
    set({ projects: initialProjects, isInitialized: true });
  },

  loadProjects: async () => {
    const result = await projectActions.getProjects();
    if (result.success) {
      set({ projects: result.data });
    } else {
      toast.error(result.error);
    }
  },

  selectProject: async (projectId) => {
    set({
      selectedProjectId: projectId,
      isLoading: true,
      selectedCardIds: new Set(),
      editingCell: null,
    });

    const [propsResult, cardsResult] = await Promise.all([
      propertyActions.getProperties(projectId),
      cardActions.getCards(projectId),
    ]);

    set({
      properties: propsResult.success ? propsResult.data : [],
      cards: cardsResult.success ? cardsResult.data : [],
      isLoading: false,
    });

    if (!propsResult.success) toast.error(propsResult.error);
    if (!cardsResult.success) toast.error(cardsResult.error);
  },

  createProject: async (input) => {
    const result = await projectActions.createProject(input);
    if (result.success) {
      set((state) => ({ projects: [result.data, ...state.projects] }));
      return result.data;
    }
    toast.error(result.error);
    return null;
  },

  // Property actions
  addProperty: async (input) => {
    const { selectedProjectId } = get();
    if (!selectedProjectId) return;

    const result = await propertyActions.createProperty({
      project_id: selectedProjectId,
      ...input,
    });

    if (result.success) {
      set((state) => ({
        properties: [...state.properties, result.data],
      }));
    } else {
      toast.error(result.error);
    }
  },

  updateProperty: async (propertyId, input) => {
    // Optimistic update
    const prevProperties = get().properties;
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === propertyId ? { ...p, ...input } : p
      ),
    }));

    const result = await propertyActions.updateProperty(propertyId, input);
    if (!result.success) {
      set({ properties: prevProperties });
      toast.error(result.error);
    }
  },

  deleteProperty: async (propertyId) => {
    // Optimistic update
    const prevProperties = get().properties;
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== propertyId),
    }));

    const result = await propertyActions.deleteProperty(propertyId);
    if (!result.success) {
      set({ properties: prevProperties });
      toast.error(result.error);
    }
  },

  moveProperty: async (propertyId, direction) => {
    const { properties, selectedProjectId } = get();
    if (!selectedProjectId) return;

    const sorted = [...properties].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    const index = sorted.findIndex((p) => p.id === propertyId);
    if (index < 0) return;

    const swapIndex = direction === "left" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    // Swap in sorted array
    [sorted[index], sorted[swapIndex]] = [sorted[swapIndex], sorted[index]];
    const orderedIds = sorted.map((p) => p.id);

    // Optimistic update — reassign sort_order based on new position
    const prevProperties = properties;
    set({
      properties: sorted.map((p, i) => ({ ...p, sort_order: i })),
    });

    const result = await propertyActions.reorderProperties(
      selectedProjectId,
      orderedIds
    );
    if (!result.success) {
      set({ properties: prevProperties });
      toast.error(result.error);
    }
  },

  // Card actions
  addCard: async () => {
    const { selectedProjectId } = get();
    if (!selectedProjectId) return;

    const result = await cardActions.createCard(selectedProjectId);
    if (result.success) {
      set((state) => ({
        cards: [...state.cards, result.data],
      }));
    } else {
      toast.error(result.error);
    }
  },

  updateCell: async (cardId, slug, value) => {
    // Optimistic update
    const prevCards = get().cards;
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              data: {
                ...(typeof c.data === "object" && c.data !== null
                  ? (c.data as Record<string, Json>)
                  : {}),
                [slug]: value as Json,
              },
            }
          : c
      ),
    }));

    const result = await cardActions.updateCardCell(cardId, slug, value);
    if (!result.success) {
      set({ cards: prevCards });
      toast.error(result.error);
    }
  },

  deleteSelectedCards: async () => {
    const { selectedCardIds, selectedProjectId } = get();
    if (selectedCardIds.size === 0 || !selectedProjectId) return;

    const cardIds = Array.from(selectedCardIds);

    // Optimistic update
    const prevCards = get().cards;
    set((state) => ({
      cards: state.cards.filter((c) => !selectedCardIds.has(c.id)),
      selectedCardIds: new Set(),
    }));

    const result = await cardActions.deleteCards(cardIds);
    if (!result.success) {
      set({ cards: prevCards, selectedCardIds });
      toast.error(result.error);
    }
  },

  duplicateSelectedCards: async () => {
    const { selectedCardIds, selectedProjectId } = get();
    if (selectedCardIds.size === 0 || !selectedProjectId) return;

    const cardIds = Array.from(selectedCardIds);
    const result = await cardActions.duplicateCards(cardIds, selectedProjectId);

    if (result.success) {
      set((state) => ({
        cards: [...state.cards, ...result.data],
        selectedCardIds: new Set(),
      }));
    } else {
      toast.error(result.error);
    }
  },

  // Selection
  toggleCardSelection: (cardId) => {
    set((state) => {
      const next = new Set(state.selectedCardIds);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return { selectedCardIds: next };
    });
  },

  selectAllCards: () => {
    set((state) => ({
      selectedCardIds: new Set(state.cards.map((c) => c.id)),
    }));
  },

  clearSelection: () => {
    set({ selectedCardIds: new Set() });
  },

  // Cell editing & focus
  startEditing: (cardId, slug, initialKey) => {
    set({ editingCell: { cardId, slug, initialKey } });
  },

  stopEditing: () => {
    set({ editingCell: null });
  },

  setFocusedCell: (row, col) => {
    set({ focusedCell: { row, col }, editingCell: null });
  },

  clearFocusedCell: () => {
    set({ focusedCell: null });
  },
}));
