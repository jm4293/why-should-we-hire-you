import { create } from "zustand";

interface ModalStore {
  modals: {
    noKey: boolean;
  };
  openModal: (modalId: keyof ModalStore["modals"]) => void;
  closeModal: (modalId: keyof ModalStore["modals"]) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modals: {
    noKey: false,
  },
  openModal: (modalId) => set((state) => ({ modals: { ...state.modals, [modalId]: true } })),
  closeModal: (modalId) => set((state) => ({ modals: { ...state.modals, [modalId]: false } })),
}));
