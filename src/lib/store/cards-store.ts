import { create } from "zustand";
import type { Project, Property, Card, Deck, PropertyType } from "@/lib/types";
import type { Json } from "@/lib/supabase/database.types";
import * as projectActions from "@/lib/actions/projects";
import * as propertyActions from "@/lib/actions/properties";
import * as cardActions from "@/lib/actions/cards";
import * as deckActions from "@/lib/actions/decks";
import * as importActions from "@/lib/actions/import";
import type { ImportResult } from "@/lib/types/import";
import type { ColumnMapping } from "@/lib/types/import";
import { toast } from "sonner";

interface CardsState {
  // Data
  projects: Project[];
  selectedProjectId: string | null;
  properties: Property[];
  cards: Card[];
  decks: Deck[];
  selectedDeckId: string | null;
  deckCardIds: Set<string> | null; // null = no deck filter

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

  // Deck actions
  createDeck: (input: { name: string; description?: string }) => Promise<Deck | null>;
  selectDeck: (deckId: string | null) => Promise<void>;

  // Computed
  filteredCards: () => Card[];

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

  // Import
  importCards: (input: {
    project_id: string;
    mappings: ColumnMapping[];
    rows: string[][];
  }) => Promise<ImportResult | null>;

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

const LS_KEY = "cardlab:lastProjectId";

export const useCardsStore = create<CardsState>((set, get) => ({
  // Initial state
  projects: [],
  selectedProjectId: null,
  properties: [],
  cards: [],
  decks: [],
  selectedDeckId: null,
  deckCardIds: null,
  isLoading: false,
  isInitialized: false,
  selectedCardIds: new Set(),
  editingCell: null,
  focusedCell: null,

  hydrate: (initialProjects) => {
    if (get().isInitialized) return;
    set({ projects: initialProjects, isInitialized: true });

    if (initialProjects.length === 0) return;

    const stored = localStorage.getItem(LS_KEY);
    const match = stored && initialProjects.find((p) => p.id === stored);
    const projectId = match ? match.id : initialProjects[0].id;
    get().selectProject(projectId);
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
    localStorage.setItem(LS_KEY, projectId);
    set({
      selectedProjectId: projectId,
      isLoading: true,
      selectedCardIds: new Set(),
      editingCell: null,
      selectedDeckId: null,
      deckCardIds: null,
    });

    const [propsResult, cardsResult, decksResult] = await Promise.all([
      propertyActions.getProperties(projectId),
      cardActions.getCards(projectId),
      deckActions.getDecks(projectId),
    ]);

    set({
      properties: propsResult.success ? propsResult.data : [],
      cards: cardsResult.success ? cardsResult.data : [],
      decks: decksResult.success ? decksResult.data : [],
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

  // Deck actions
  createDeck: async (input) => {
    const { selectedProjectId } = get();
    if (!selectedProjectId) return null;

    const result = await deckActions.createDeck({
      project_id: selectedProjectId,
      ...input,
    });
    if (result.success) {
      set((state) => ({ decks: [result.data, ...state.decks] }));
      return result.data;
    }
    toast.error(result.error);
    return null;
  },

  selectDeck: async (deckId) => {
    if (!deckId) {
      set({ selectedDeckId: null, deckCardIds: null });
      return;
    }
    set({ selectedDeckId: deckId });
    const result = await deckActions.getDeckCardIds(deckId);
    if (result.success) {
      set({ deckCardIds: new Set(result.data) });
    } else {
      toast.error(result.error);
      set({ selectedDeckId: null, deckCardIds: null });
    }
  },

  filteredCards: () => {
    const { cards, deckCardIds } = get();
    if (!deckCardIds) return cards;
    return cards.filter((c) => deckCardIds.has(c.id));
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

  // Import
  importCards: async (input) => {
    const result = await importActions.importCards(input);
    if (result.success) {
      // Reload the project data to pick up new properties + cards
      const { selectProject } = get();
      await selectProject(input.project_id);
      toast.success(
        `Imported ${result.data.importedCount} cards` +
          (result.data.createdProperties.length > 0
            ? ` and created ${result.data.createdProperties.length} new properties`
            : "")
      );
      return result.data;
    }
    toast.error(result.error);
    return null;
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
