"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalyzeHeader } from "@/components/analyze/AnalyzeHeader";
import { AnalyzeWizard } from "@/components/analyze/AnalyzeWizard";
import { HistorySidebar } from "@/components/history/HistorySidebar";
import { MobileGuard } from "@/components/common/MobileGuard";
import { hasAnyAPIKey } from "@/lib/storage/api-keys";
import { useAnalysisStore } from "@/hooks/useAnalysisStore";
import { useModalStore } from "@/hooks/useModalStore";
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
      <AnalyzeHeader onNewAnalysis={handleNewAnalysis} />

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
