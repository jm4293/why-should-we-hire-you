"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeFile } from "@/types";

interface PDFViewerProps {
  files: ResumeFile[];
}

export function PDFViewer({ files }: PDFViewerProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const activeFile = files[activeIdx];

  if (files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground/70">
        <div className="text-center">
          <FileText size={32} className="mx-auto mb-2" />
          <p className="text-sm">업로드된 파일이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* 파일 탭 */}
      {files.length > 1 && (
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-muted/50 px-3 py-2">
          {files.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
                activeIdx === i
                  ? "bg-background font-medium text-primary shadow-sm"
                  : "text-muted-foreground hover:text-gray-700"
              )}
            >
              {f.type === "resume" ? "이력서" : "추가 서류"} — {f.name.replace(".pdf", "")}
            </button>
          ))}
        </div>
      )}

      {/* PDF 뷰어 */}
      <div className="flex-1 overflow-hidden bg-muted">
        {activeFile?.dataUrl ? (
          <iframe
            key={activeFile.name}
            src={activeFile.dataUrl}
            className="h-full w-full border-0"
            title={activeFile.name}
          />
        ) : (
          /* dataUrl 없으면 텍스트 fallback */
          <div className="h-full overflow-y-auto p-5">
            <div className="min-h-full rounded-xl bg-background p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
                <FileText size={14} className="text-muted-foreground/70" />
                <span className="text-xs font-medium text-muted-foreground">{activeFile?.name}</span>
              </div>
              <pre className="font-sans text-xs leading-relaxed whitespace-pre-wrap text-gray-700">
                {activeFile?.text || "내용이 없습니다."}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
