"use client";

import dynamic from "next/dynamic";
import { useModals } from "@/hooks/useModalStore";

const NoKeyModal = dynamic(() => import("./NoKeyModal").then((mod) => mod.NoKeyModal));

export function GlobalModalProvider() {
  const modals = useModals();

  return (
    <>
      <NoKeyModal open={modals.noKey} />
    </>
  );
}
