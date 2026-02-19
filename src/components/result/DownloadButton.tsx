"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AnalysisResult, InterviewerResult } from "@/types";

interface DownloadButtonProps {
  result: AnalysisResult;
}

export function DownloadButton({ result }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const generateHTML = (results: InterviewerResult[]) => {
    const content = results
      .map(
        (r) => `
        <div class="interviewer">
          <h1>${r.personaName} (${r.provider})</h1>
          <div class="content">${(r.streamText ?? "").replace(/\n/g, "<br/>")}</div>
        </div>
      `
      )
      .join('<div class="divider"></div>');

    const resumeText = result.input.resumeFiles
      .map((f) => `<h3>${f.name}</h3><pre>${f.text}</pre>`)
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <title>${result.companyName} - ${result.jobTitle} 분석 결과</title>
        <style>
          body { font-family: 'Pretendard', -apple-system, sans-serif; font-size: 13px; color: #1a1a1a; margin: 0; padding: 32px; }
          h1 { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #111; }
          h2 { font-size: 15px; font-weight: 600; margin: 24px 0 8px; color: #333; }
          h3 { font-size: 13px; font-weight: 600; margin: 16px 0 4px; color: #555; }
          .interviewer { page-break-before: always; padding: 24px 0; }
          .interviewer:first-child { page-break-before: avoid; }
          .content { line-height: 1.8; white-space: pre-wrap; }
          .divider { border-top: 2px solid #eee; margin: 32px 0; }
          .resume-section { margin-top: 48px; border-top: 2px solid #ddd; padding-top: 24px; }
          pre { white-space: pre-wrap; font-size: 11px; line-height: 1.7; color: #555; }
          .meta { font-size: 11px; color: #888; margin-bottom: 24px; }
        </style>
      </head>
      <body>
        <div class="meta">
          분석 일시: ${new Date(result.createdAt).toLocaleString("ko-KR")} ·
          회사: ${result.companyName} ·
          직무: ${result.jobTitle}
        </div>
        ${content}
        <div class="resume-section">
          <h2>원본 서류</h2>
          ${resumeText}
        </div>
      </body>
      </html>
    `;
  };

  const download = async (results: InterviewerResult[], filename: string) => {
    setLoading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const html = generateHTML(results);
      const container = document.createElement("div");
      container.innerHTML = html;
      document.body.appendChild(container);

      await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          filename: `${filename}.pdf`,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(container)
        .save();

      document.body.removeChild(container);
    } catch (err) {
      console.error("PDF 생성 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const doneResults = result.interviewerResults.filter((r) => r.status === "done");
  const filename = `${result.companyName}_${result.jobTitle}_분석결과`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || doneResults.length === 0}
          className="gap-1.5 text-xs"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          PDF 다운로드
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => download(doneResults, `${filename}_전체`)}
          className="text-xs"
        >
          전체 면접관 결과 다운로드
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {doneResults.map((r) => (
          <DropdownMenuItem
            key={r.personaId}
            onClick={() => download([r], `${filename}_${r.personaName}`)}
            className="text-xs"
          >
            {r.personaName} 결과만 다운로드
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
