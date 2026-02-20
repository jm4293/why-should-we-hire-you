"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Save, ArrowLeft, Monitor } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { ResultPanel } from "@/components/result/ResultPanel";
import { PDFViewer } from "@/components/result/PDFViewer";
import { DownloadButton } from "@/components/result/DownloadButton";
import { HistorySidebar } from "@/components/history/HistorySidebar";
import { useAnalysisStore } from "@/store/analysis";
import { useHistoryStore } from "@/store/history";
import { getAllAPIKeys } from "@/lib/storage/api-keys";
import { cn } from "@/lib/utils";
import type { AnalysisResult, InterviewerResult, HistoryItem } from "@/types";

function MobileGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 md:hidden">
        <Monitor size={40} className="text-muted-foreground/50" />
        <h2 className="text-primary text-xl font-semibold">데스크탑에서 이용하세요</h2>
        <p className="text-muted-foreground text-center text-sm leading-relaxed">
          이 서비스는 넓은 화면에서 최적화되어 있습니다.
          <br />
          PC 또는 노트북에서 접속해주세요.
        </p>
      </div>
      <div className="hidden md:flex md:h-screen md:flex-col">{children}</div>
    </>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const { input, setInput, results, setResults, updateResult, isAnalyzing, setIsAnalyzing } =
    useAnalysisStore();
  const { save: saveHistory } = useHistoryStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);
  const abortRefs = useRef<Record<string, AbortController>>({});

  const personas = input.personas ?? [];

  // 초기 결과 상태 세팅 & 분석 시작
  useEffect(() => {
    // 히스토리에서 불러온 결과가 이미 있으면 분석 시작하지 않음
    if (results.length > 0) {
      setActiveTab(results[0].personaId);
      buildAnalysisResult(results);
      return;
    }

    if (!input.personas?.length) {
      router.push("/analyze");
      return;
    }

    const initial: InterviewerResult[] = personas.map((p) => ({
      personaId: p.id,
      personaName: p.name,
      provider: p.provider,
      model: p.model,
      summary: "",
      fitReasons: [],
      weaknesses: [],
      resumeRevisions: [],
      coverLetterAnswers: [],
      status: "pending",
      streamText: "",
    }));

    setResults(initial);
    setActiveTab(initial[0]?.personaId ?? "");
    setIsAnalyzing(true);

    // 병렬 스트리밍
    initial.forEach((r) => runStream(r.personaId));

    const abortControllers = abortRefs.current;
    return () => {
      Object.values(abortControllers).forEach((ctrl) => ctrl.abort());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runStream = async (personaId: string) => {
    const persona = personas.find((p) => p.id === personaId);
    if (!persona) return;

    const apiKeys = getAllAPIKeys();
    const key = apiKeys.find((k) => k.provider === persona.provider);
    if (!key) {
      updateResult(personaId, { status: "error", error: "API 키가 없습니다." });
      return;
    }

    const ctrl = new AbortController();
    abortRefs.current[personaId] = ctrl;

    updateResult(personaId, { status: "streaming", streamText: "" });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, persona, apiKey: key.key }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "분석 요청에 실패했습니다.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        updateResult(personaId, { streamText: accumulated });
      }

      updateResult(personaId, { status: "done", streamText: accumulated });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      updateResult(personaId, { status: "error", error: message });
    } finally {
      delete abortRefs.current[personaId];
      // 모든 스트림 완료 확인
      checkAllDone();
    }
  };

  const checkAllDone = () => {
    const latest = useAnalysisStore.getState().results;
    const allDone = latest.every((r) => r.status === "done" || r.status === "error");
    if (allDone) {
      setIsAnalyzing(false);
      buildAnalysisResult(latest);

      const hasSuccess = latest.some((r) => r.status === "done");
      if (hasSuccess) {
        toast.success("AI 면접관의 분석이 완료되었습니다!");
      } else {
        toast.error("모든 분석이 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const buildAnalysisResult = (results: InterviewerResult[]) => {
    const ar: AnalysisResult = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      companyName: extractCompanyName(input.companyInfo?.companyUrl ?? ""),
      jobTitle: extractJobTitle(input.companyInfo?.jobUrl ?? ""),
      companyUrl: input.companyInfo?.companyUrl ?? "",
      jobUrl: input.companyInfo?.jobUrl ?? "",
      interviewerResults: results,
      input: input as AnalysisResult["input"],
    };
    setAnalysisResult(ar);
  };

  const handleSave = async () => {
    if (!analysisResult) return;
    const historyItem: HistoryItem = {
      id: analysisResult.id,
      createdAt: analysisResult.createdAt,
      companyName: analysisResult.companyName,
      jobTitle: analysisResult.jobTitle,
      companyUrl: analysisResult.companyUrl,
      providers: [...new Set(results.map((r) => r.provider))],
      result: analysisResult,
    };
    await saveHistory(historyItem);
    setIsSaved(true);
    toast.success("분석 결과가 저장됐습니다.");
  };

  const handleRetry = (personaId: string) => {
    updateResult(personaId, {
      status: "pending",
      streamText: "",
      error: undefined,
    });
    setIsAnalyzing(true);
    runStream(personaId);
  };

  const currentResult = results.find((r) => r.personaId === activeTab);

  const statusIcon = (r: InterviewerResult) => {
    if (r.status === "done") return <CheckCircle size={12} className="text-muted-foreground" />;
    if (r.status === "error") return <span className="h-2 w-2 rounded-full bg-gray-400" />;
    if (r.status === "streaming")
      return <Loader2 size={12} className="text-muted-foreground/70 animate-spin" />;
    return <span className="h-2 w-2 rounded-full bg-gray-200" />;
  };

  return (
    <MobileGuard>
      {/* 상단 네비 */}
      <header className="border-border bg-background flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/analyze")}
            className="text-muted-foreground hover:text-primary/90 flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft size={14} />새 분석
          </button>
          <span className="text-muted-foreground/30">|</span>
          <span className="text-sm font-medium text-gray-700">
            {analysisResult?.companyName
              ? `${analysisResult.companyName} — ${analysisResult.jobTitle}`
              : "분석 중..."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {analysisResult && <DownloadButton result={analysisResult} />}
          <Button
            size="sm"
            variant={isSaved ? "outline" : "default"}
            onClick={handleSave}
            disabled={isSaved || isAnalyzing || results.length === 0}
            className="gap-1.5 text-xs"
          >
            <Save size={13} />
            {isSaved ? "저장됨" : "결과 저장"}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 히스토리 사이드바 */}
        <HistorySidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          onSelect={(item) => {
            setInput(item.result.input);
            setAnalysisResult(item.result);
            setResults(item.result.interviewerResults);
            setActiveTab(item.result.interviewerResults[0]?.personaId ?? "");
            buildAnalysisResult(item.result.interviewerResults);
            setIsSaved(true);
          }}
        />

        {/* 메인 영역 */}
        <main className="flex min-h-0 flex-1 flex-col">
          {/* 면접관 탭 */}
          <div className="border-border bg-background shrink-0 border-b px-6">
            <div className="flex gap-1 overflow-x-auto py-2">
              {results.map((r, i) => (
                <button
                  key={r.personaId}
                  onClick={() => setActiveTab(r.personaId)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs transition-colors",
                    activeTab === r.personaId
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {statusIcon(r)}
                  <span>
                    {r.personaName || `면접관 ${i + 1}`}{" "}
                    <span className="font-normal opacity-70">({r.model})</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* 왼쪽: PDF 뷰어 */}
            <div className="border-border flex w-1/4 flex-col border-r">
              <div className="border-border/50 bg-muted/50 flex shrink-0 items-center gap-2 border-b px-4 py-2">
                <span className="text-muted-foreground/70 text-[11px] font-medium tracking-wide uppercase">
                  제출 서류
                </span>
              </div>
              <div className="min-h-0 flex-1">
                <PDFViewer files={input.resumeFiles ?? []} />
              </div>
            </div>

            {/* 오른쪽: AI 결과 */}
            <div className="flex w-3/4 flex-col">
              <div className="border-border/50 bg-muted/50 flex shrink-0 items-center gap-2 border-b px-4 py-2">
                <span className="text-muted-foreground/70 text-[11px] font-medium tracking-wide uppercase">
                  AI 분석 결과
                </span>
              </div>
              <div className="min-h-0 flex-1">
                {currentResult ? (
                  <ResultPanel result={currentResult} onRetry={handleRetry} />
                ) : (
                  <div className="text-muted-foreground/70 flex h-full items-center justify-center text-sm">
                    면접관을 선택해주세요.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </MobileGuard>
  );
}

function extractCompanyName(url: string): string {
  if (!url) return "회사명 미상";
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return hostname.split(".")[0];
  } catch {
    return "회사명 미상";
  }
}

function extractJobTitle(url: string): string {
  if (!url) return "직무 미상";
  return "분석 결과";
}
