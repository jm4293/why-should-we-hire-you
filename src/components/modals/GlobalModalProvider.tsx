"use client";

import dynamic from "next/dynamic";
import { useModalStore } from "@/hooks/useModalStore";

const NoKeyModal = dynamic(() => import("./NoKeyModal").then((mod) => mod.NoKeyModal));

export function GlobalModalProvider() {
  const { modals } = useModalStore();

  return (
    <>
      <NoKeyModal open={modals.noKey} />
    </>
  );
}
