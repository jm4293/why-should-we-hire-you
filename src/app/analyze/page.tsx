"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Plus, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnalyzeWizard } from "@/components/analyze/AnalyzeWizard";
import { HistorySidebar } from "@/components/history/HistorySidebar";
import { hasAnyAPIKey } from "@/lib/storage/api-keys";
import { useAnalysisStore } from "@/store/analysis";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "@/types";

function MobileGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 모바일 안내 */}
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 md:hidden">
        <Monitor size={40} className="text-muted-foreground/50" />
        <h2 className="text-xl font-semibold text-primary">데스크탑에서 이용하세요</h2>
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          이 서비스는 넓은 화면에서 최적화되어 있습니다.
          <br />
          PC 또는 노트북에서 접속해주세요.
        </p>
      </div>
      {/* 데스크탑 */}
      <div className="hidden md:flex md:h-screen md:flex-col">{children}</div>
    </>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const { reset, setInput, setResults, setIsAnalyzing } = useAnalysisStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNoKeyModal, setShowNoKeyModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !hasAnyAPIKey()) {
      setShowNoKeyModal(true);
    }
  }, []);

  const handleNewAnalysis = () => {
    reset();
    setSelectedHistory(null);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setSelectedHistory(item);
    setInput(item.result.input);
    setResults(item.result.interviewerResults);
    setIsAnalyzing(false);
    router.push("/analyze/result");
  };

  return (
    <MobileGuard>
      {/* API 키 없음 모달 */}
      <Dialog open={showNoKeyModal} onOpenChange={setShowNoKeyModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">API 키가 필요합니다</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">
            서비스를 이용하려면 OpenAI, Anthropic, Google 중 하나 이상의 API 키를 먼저 등록해야
            합니다. 설정 페이지에서 발급 방법도 확인할 수 있습니다.
          </p>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setShowNoKeyModal(false);
                router.push("/settings");
              }}
            >
              설정으로 이동
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 상단 네비 */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-sm font-semibold text-primary hover:text-muted-foreground"
          >
            Why Should We Hire You?
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewAnalysis}
            className="gap-1.5 text-xs"
          >
            <Plus size={13} />새 분석
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/settings")}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <Settings size={14} />
            설정
          </Button>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className="flex min-h-0 flex-1">
        {/* 히스토리 사이드바 */}
        <HistorySidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          currentId={selectedHistory?.id}
          onSelect={handleSelectHistory}
        />

        {/* 콘텐츠 영역 */}
        <main className={cn("flex min-h-0 flex-1 flex-col overflow-hidden")}>
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-6 py-8">
              <AnalyzeWizard />
            </div>
          </div>
        </main>
      </div>
    </MobileGuard>
  );
}
