import { create } from "zustand";
import type { HistoryItem } from "@/types";
import { getAllHistory, saveHistory, deleteHistory, clearAllHistory } from "@/lib/storage/db";

interface HistoryStore {
  items: HistoryItem[];
  isLoaded: boolean;
  load: () => Promise<void>;
  save: (item: HistoryItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  items: [],
  isLoaded: false,

  load: async () => {
    if (get().isLoaded) return;
    const items = await getAllHistory();
    set({ items, isLoaded: true });
  },

  save: async (item) => {
    await saveHistory(item);
    const items = await getAllHistory();
    set({ items });
  },

  remove: async (id) => {
    await deleteHistory(id);
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  clear: async () => {
    await clearAllHistory();
    set({ items: [] });
  },
}));
