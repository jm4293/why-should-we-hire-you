"use client";

import { CheckCircle, AlertCircle, FileText, Globe, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisInput } from "@/types";

const PROVIDER_LABELS = { openai: "OpenAI", anthropic: "Claude", google: "Gemini" };

interface Step5ConfirmProps {
  input: Partial<AnalysisInput>;
}

export function Step5Confirm({ input }: Step5ConfirmProps) {
  const { companyInfo, resumeFiles = [], coverLetterItems = [], personas = [] } = input;

  const contentPreview = (text?: string) => {
    if (!text) return null;
    return text.slice(0, 80).replace(/\s+/g, " ").trim() + (text.length > 80 ? "..." : "");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-primary text-xl font-semibold">최종 확인</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          아래 내용을 확인한 후 분석을 시작하세요.
        </p>
      </div>

      {/* 회사 정보 */}
      <div className="border-border bg-background space-y-3 rounded-2xl border p-5">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-muted-foreground" />
          <span className="text-primary text-sm font-semibold">회사 정보</span>
        </div>

        <div className="space-y-3">
          {/* 채용 공고 */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              {companyInfo?.jobContent ? (
                <CheckCircle size={12} className="text-muted-foreground shrink-0" />
              ) : (
                <AlertCircle size={12} className="text-muted-foreground/70 shrink-0" />
              )}
              <span className="text-muted-foreground shrink-0 text-xs">채용 공고 URL</span>
            </div>
            <div className="space-y-0.5 pl-4">
              <p
                className={cn(
                  "text-xs",
                  companyInfo?.jobUrl ? "text-gray-700" : "text-muted-foreground/70"
                )}
              >
                {companyInfo?.jobUrl || "미입력"}
              </p>
              {companyInfo?.jobContent && (
                <p className="text-muted-foreground/70 text-xs leading-relaxed">
                  {contentPreview(companyInfo.jobContent)}
                </p>
              )}
            </div>
          </div>

          {/* 회사 소개 */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              {companyInfo?.companyContent ? (
                <CheckCircle size={12} className="text-muted-foreground shrink-0" />
              ) : (
                <AlertCircle size={12} className="text-muted-foreground/70 shrink-0" />
              )}
              <span className="text-muted-foreground shrink-0 text-xs">회사 소개 URL</span>
            </div>
            <div className="space-y-0.5 pl-4">
              <p
                className={cn(
                  "text-xs",
                  companyInfo?.companyUrl ? "text-gray-700" : "text-muted-foreground/70"
                )}
              >
                {companyInfo?.companyUrl || "미입력"}
              </p>
              {companyInfo?.companyContent && (
                <p className="text-muted-foreground/70 text-xs leading-relaxed">
                  {contentPreview(companyInfo.companyContent)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 내 서류 */}
      <div className="border-border bg-background space-y-3 rounded-2xl border p-5">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-muted-foreground" />
          <span className="text-primary text-sm font-semibold">내 서류</span>
        </div>
        <div className="space-y-1.5">
          {resumeFiles.length === 0 ? (
            <p className="text-muted-foreground/70 text-xs">업로드된 파일 없음</p>
          ) : (
            resumeFiles.map((f) => (
              <div key={f.name} className="flex items-center gap-2 text-xs">
                <CheckCircle size={12} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground shrink-0">
                  {f.type === "resume" ? "이력서" : "추가 서류"}
                </span>
                <span className="truncate text-gray-700">{f.name}</span>
                <span className="text-muted-foreground/70 shrink-0">
                  ({Math.round(f.text.length / 400)}페이지 분량)
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 자소서 문항 */}
      <div className="border-border bg-background space-y-3 rounded-2xl border p-5">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-muted-foreground" />
          <span className="text-primary text-sm font-semibold">자소서 문항</span>
          <span className="text-muted-foreground/70 text-xs">({coverLetterItems.length}개)</span>
        </div>
        {coverLetterItems.length === 0 ? (
          <p className="text-muted-foreground/70 text-xs">자소서 초안이 생략됩니다.</p>
        ) : (
          <div className="space-y-2">
            {coverLetterItems.map((item, i) => (
              <div key={item.id} className="flex items-start gap-2 text-xs">
                <CheckCircle size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground/70">
                    문항 {i + 1} · 최대 {item.maxLength}자
                  </span>
                  <p className="mt-0.5 text-gray-700">
                    {item.question.slice(0, 60)}
                    {item.question.length > 60 ? "..." : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 면접관 */}
      <div className="border-border bg-background space-y-3 rounded-2xl border p-5">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-muted-foreground" />
          <span className="text-primary text-sm font-semibold">AI 면접관</span>
          <span className="text-muted-foreground/70 text-xs">({personas.length}명)</span>
        </div>
        <div className="space-y-3">
          {personas.map((p) => (
            <div key={p.id} className="flex items-start gap-2 text-xs">
              <CheckCircle size={12} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-700">{p.name || "직책 미설정"}</span>
                  <span className="text-muted-foreground/70">
                    · {PROVIDER_LABELS[p.provider]} · {p.model}
                  </span>
                </div>
                {p.description && (
                  <p className="text-muted-foreground/70 mt-0.5 leading-relaxed">
                    {p.description.slice(0, 80)}
                    {p.description.length > 80 ? "..." : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 비용 안내 */}
      <div className="border-border bg-muted/50 rounded-2xl border p-5">
        <div className="flex gap-3">
          <AlertCircle size={16} className="text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-primary/90 font-medium">분석 시작 전 확인하세요</p>
            <ul className="text-muted-foreground mt-1.5 space-y-1 text-xs">
              <li>분석을 시작하면 등록된 API 키로 비용이 발생합니다.</li>
              <li>
                면접관 {personas.length}명 기준 약 ${(personas.length * 0.05).toFixed(2)}~$
                {(personas.length * 0.1).toFixed(2)} 수준의 비용이 예상됩니다.
              </li>
              <li>분석 중 중단해도 이미 발생한 비용은 취소되지 않습니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
