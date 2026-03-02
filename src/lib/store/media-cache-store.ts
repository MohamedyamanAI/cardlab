import { create } from "zustand";
import { resolveMediaIds as resolveMediaIdsAction } from "@/lib/actions/media";

interface MediaCacheEntry {
  signedUrl: string;
  storagePath: string;
  originalName: string;
  expiresAt: number;
}

interface MediaCacheState {
  entries: Map<string, MediaCacheEntry>;
  pending: Set<string>;

  resolveMediaIds: (mediaIds: string[]) => Promise<void>;
  getSignedUrl: (mediaId: string) => string | undefined;
  getEntry: (mediaId: string) => MediaCacheEntry | undefined;
  invalidate: (mediaIds: string[]) => void;
  clear: () => void;
}

const CACHE_TTL_MS = 50 * 60 * 1000; // 50 minutes

export const useMediaCacheStore = create<MediaCacheState>((set, get) => ({
  entries: new Map(),
  pending: new Set(),

  resolveMediaIds: async (mediaIds) => {
    const { entries, pending } = get();
    const now = Date.now();

    const needed = mediaIds.filter((id) => {
      if (pending.has(id)) return false;
      const entry = entries.get(id);
      if (entry && entry.expiresAt > now) return false;
      return true;
    });

    if (needed.length === 0) return;

    // Mark as pending
    set((state) => {
      const next = new Set(state.pending);
      needed.forEach((id) => next.add(id));
      return { pending: next };
    });

    try {
      const result = await resolveMediaIdsAction(needed);

      if (result.success) {
        set((state) => {
          const nextEntries = new Map(state.entries);
          const nextPending = new Set(state.pending);
          const expiresAt = Date.now() + CACHE_TTL_MS;

          for (const [id, data] of Object.entries(result.data)) {
            nextEntries.set(id, { ...data, expiresAt });
            nextPending.delete(id);
          }

          // Clear pending for IDs not found (e.g. deleted media)
          for (const id of needed) {
            nextPending.delete(id);
          }

          return { entries: nextEntries, pending: nextPending };
        });
      } else {
        // Clear pending on error so retries can happen
        set((state) => {
          const nextPending = new Set(state.pending);
          needed.forEach((id) => nextPending.delete(id));
          return { pending: nextPending };
        });
      }
    } catch {
      set((state) => {
        const nextPending = new Set(state.pending);
        needed.forEach((id) => nextPending.delete(id));
        return { pending: nextPending };
      });
    }
  },

  getSignedUrl: (mediaId) => {
    const entry = get().entries.get(mediaId);
    if (!entry || entry.expiresAt <= Date.now()) return undefined;
    return entry.signedUrl;
  },

  getEntry: (mediaId) => {
    const entry = get().entries.get(mediaId);
    if (!entry || entry.expiresAt <= Date.now()) return undefined;
    return entry;
  },

  invalidate: (mediaIds) => {
    set((state) => {
      const next = new Map(state.entries);
      mediaIds.forEach((id) => next.delete(id));
      return { entries: next };
    });
  },

  clear: () => {
    set({ entries: new Map(), pending: new Set() });
  },
}));
