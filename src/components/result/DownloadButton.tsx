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

function formatProvider(provider: string) {
  switch (provider.toLowerCase()) {
    case "google":
      return "Gemini";
    case "openai":
      return "ChatGPT";
    case "anthropic":
      return "Claude";
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}

export function DownloadButton({ result }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const generateHTML = async (results: InterviewerResult[]) => {
    // Dynamically import marked so we don't increase initial bundle size
    const { marked } = await import("marked");

    const content = results
      .map(
        (r) => `
        <div class="interviewer">
          <h1>${r.personaName} <span class="provider">(${formatProvider(r.provider ?? "")})</span></h1>
          <div class="content markdown-body">${marked.parse(r.streamText ?? "")}</div>
        </div>
      `
      )
      .join('<div class="divider"></div>');

    return `
      <div id="pdf-wrapper">
        <style>
          #pdf-wrapper { 
            font-family: 'Pretendard', -apple-system, sans-serif; 
            font-size: 13px; 
            color: #1a1a1a; 
            margin: 0; 
            padding: 32px; 
            background: #ffffff;
            text-align: left;
          }
          #pdf-wrapper h1 { font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #111; border-bottom: 2px solid #eee; padding-bottom: 8px; }
          #pdf-wrapper h1 .provider { font-size: 14px; font-weight: 400; color: #666; vertical-align: middle; }
          #pdf-wrapper .interviewer { page-break-before: always; padding: 24px 0; }
          #pdf-wrapper .interviewer:first-child { page-break-before: avoid; padding-top: 0; }
          #pdf-wrapper .divider { border-top: 2px solid #eee; margin: 32px 0; }
          #pdf-wrapper .meta { font-size: 12px; color: #888; margin-bottom: 32px; text-align: right; }
          
          /* Markdown specific styles */
          #pdf-wrapper .markdown-body { line-height: 1.6; color: #24292f; }
          #pdf-wrapper .markdown-body h2 { font-size: 18px; font-weight: 600; margin: 24px 0 16px; color: #111; }
          #pdf-wrapper .markdown-body h3 { font-size: 16px; font-weight: 600; margin: 20px 0 12px; color: #333; }
          #pdf-wrapper .markdown-body p { margin-bottom: 16px; }
          #pdf-wrapper .markdown-body ul, #pdf-wrapper .markdown-body ol { margin-bottom: 16px; padding-left: 24px; }
          #pdf-wrapper .markdown-body li { margin-bottom: 4px; }
          #pdf-wrapper .markdown-body strong { font-weight: 600; color: #111; }
          #pdf-wrapper .markdown-body code { font-family: ui-monospace, monospace; background: rgba(175, 184, 193, 0.2); padding: 0.2em 0.4em; border-radius: 6px; font-size: 85%; }
          #pdf-wrapper .markdown-body pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; font-size: 85%; line-height: 1.45; margin-bottom: 16px; }
          #pdf-wrapper .markdown-body pre code { background: transparent; padding: 0; }
          #pdf-wrapper .markdown-body blockquote { margin: 0 0 16px 0; padding: 0 1em; color: #57606a; border-left: 0.25em solid #d0d7de; }
          
          /* Override any inheriting CSS variables from Tailwind base layer */
          #pdf-wrapper, #pdf-wrapper * {
            --border: #e5e7eb;
            --ring: transparent;
            --background: #ffffff;
            --foreground: #1a1a1a;
            border-color: #e5e7eb;
            outline-color: transparent;
          }
          
          #pdf-wrapper .divider { border-color: #eee; }
        </style>
        <div class="meta">
          분석 일시: ${new Date(result.createdAt).toLocaleString("ko-KR")} <br/>
          회사: <strong>${result.companyName}</strong> ·
          직무: <strong>${result.jobTitle}</strong>
        </div>
        ${content}
      </div>
    `;
  };

  const download = async (results: InterviewerResult[], filename: string) => {
    setLoading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const html = await generateHTML(results);

      const container = document.createElement("div");
      // html2canvas fails when parsing modern CSS functions like oklch() or lab().
      // Tailwind uses oklch() in variables (e.g., --border, --ring).
      // We explicitly override them here to avoid the rendering crash.
      container.style.setProperty("--border", "#e5e7eb");
      container.style.setProperty("--ring", "transparent");
      container.style.setProperty("--background", "#ffffff");
      container.style.setProperty("--foreground", "#1a1a1a");
      container.innerHTML = html;

      document.body.appendChild(container);

      await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          filename: `${filename}.pdf`,
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            onclone: (clonedDoc: Document) => {
              // Strip all global stylesheets from the cloned document to prevent
              // html2canvas from parsing unsupported CSS functions (like oklch or lab).
              // We only keep the inline style within our #pdf-wrapper container.
              const extraneousStyles = clonedDoc.querySelectorAll("style, link[rel='stylesheet']");
              extraneousStyles.forEach((s) => {
                if (!s.closest("#pdf-wrapper")) {
                  s.remove();
                }
              });
            },
          },
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
            {r.personaName} ({formatProvider(r.provider)}) 결과만 다운로드
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
