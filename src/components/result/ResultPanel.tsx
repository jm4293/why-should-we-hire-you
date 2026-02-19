"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InterviewerResult } from "@/types";

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
      <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 size={24} className="animate-spin" />
        <p className="text-sm">분석 대기 중...</p>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <XCircle size={32} className="text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-800">분석에 실패했습니다</p>
          <p className="mt-1 text-xs text-gray-500">{result.error}</p>
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
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          <span>분석 중...</span>
        </div>
      )}

      {streamedText && (
        <div className="prose prose-sm max-w-none text-gray-800">
          <StreamingMarkdown text={streamedText} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-gray-800">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function StreamingMarkdown({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1;

        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="mt-6 mb-2 text-base font-semibold text-gray-900 first:mt-0">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="mt-4 mb-1.5 text-sm font-semibold text-gray-800">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="ml-4 list-disc text-gray-700">
              {renderInline(line.slice(2))}
            </li>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }

        return (
          <p key={i} className="text-gray-700">
            {renderInline(line)}
            {isLast && isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-400" />
            )}
          </p>
        );
      })}
    </div>
  );
}
