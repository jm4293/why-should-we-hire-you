"use client";

import { useModalStore } from "@/store/modal";
import { NoKeyModal } from "./NoKeyModal";

export function GlobalModalProvider() {
  const { modals } = useModalStore();

  return (
    <>
      <NoKeyModal open={modals.noKey} />
    </>
  );
}
