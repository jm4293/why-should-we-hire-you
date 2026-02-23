"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalActions } from "@/hooks/useModalStore";

export function NoKeyModal({ open }: { open: boolean }) {
  const router = useRouter();
  const { closeModal } = useModalActions();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeModal("noKey");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">API 키가 필요합니다</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm leading-relaxed">
          서비스를 이용하려면 OpenAI, Anthropic, Google 중 하나 이상의 API 키를 먼저 등록해야
          합니다. 설정 페이지에서 발급 방법도 확인할 수 있습니다.
        </p>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              closeModal("noKey");
              router.push("/settings");
            }}
          >
            설정으로 이동
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
