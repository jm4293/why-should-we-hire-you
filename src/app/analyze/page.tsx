"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyzeWizard } from "@/components/analyze/AnalyzeWizard";
import { HistorySidebar } from "@/components/history/HistorySidebar";
import { MobileGuard } from "@/components/common/MobileGuard";
import { hasAnyAPIKey } from "@/lib/storage/api-keys";
import { useAnalysisStore } from "@/store/analysis";
import { useModalStore } from "@/store/modal";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "@/types";

export default function AnalyzePage() {
  const router = useRouter();
  const { reset, setInput, setResults, setIsAnalyzing } = useAnalysisStore();
  const openModal = useModalStore((state) => state.openModal);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !hasAnyAPIKey()) {
      openModal("noKey");
    }
  }, [openModal]);

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
      {/* 상단 네비 */}
      <header className="border-border bg-background flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-primary hover:text-muted-foreground text-sm font-semibold"
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
            className="text-muted-foreground gap-1.5 text-xs"
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
