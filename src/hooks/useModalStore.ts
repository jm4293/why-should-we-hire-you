import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

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

// Actions
export const useModalActions = () =>
  useModalStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  );

// Selectors
export const useModals = () => useModalStore((state) => state.modals);
export const useIsModalOpen = (modalId: keyof ModalStore["modals"]) =>
  useModalStore((state) => state.modals[modalId]);
