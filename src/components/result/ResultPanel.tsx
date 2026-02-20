"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InterviewerResult } from "@/types";
import { StreamingMarkdown } from "./StreamingMarkdown";

interface ResultPanelProps {
  result: InterviewerResult;
  onRetry: (personaId: string) => void;
}

export function ResultPanel({ result, onRetry }: ResultPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [streamedText, setStreamedText] = useState(result.streamText ?? "");

  useEffect(() => {
    setStreamedText(result.streamText ?? "");
  }, [result.streamText]);

  if (result.status === "pending") {
    return (
      <div className="text-muted-foreground/70 flex h-full flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin" />
        <p className="text-sm">분석 대기 중...</p>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <XCircle size={32} className="text-muted-foreground/70" />
        <div>
          <p className="text-primary/90 text-sm font-medium">분석에 실패했습니다</p>
          <p className="text-muted-foreground mt-1 text-xs">{result.error}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRetry(result.personaId)}
          className="gap-1.5 text-xs"
        >
          <RotateCcw size={12} />
          다시 시도
        </Button>
      </div>
    );
  }

  const isStreaming = result.status === "streaming";

  return (
    <div ref={contentRef} className="h-full overflow-y-auto px-6 py-5">
      {isStreaming && !streamedText && (
        <div className="text-muted-foreground/70 flex items-center gap-2 text-sm">
          <Loader2 size={14} className="animate-spin" />
          <span>분석 중...</span>
        </div>
      )}

      {streamedText && (
        <div className="prose prose-sm text-primary/90 max-w-none">
          <StreamingMarkdown text={streamedText} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  );
}
