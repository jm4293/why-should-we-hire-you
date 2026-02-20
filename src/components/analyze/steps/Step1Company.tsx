"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompanyInfo } from "@/types";

interface Step1CompanyProps {
  value: Partial<CompanyInfo>;
  onChange: (value: Partial<CompanyInfo>) => void;
}

type CrawlState = "idle" | "loading" | "success" | "error";

export function Step1Company({ value, onChange }: Step1CompanyProps) {
  const [companyCrawl, setCompanyCrawl] = useState<CrawlState>("idle");
  const [jobCrawl, setJobCrawl] = useState<CrawlState>("idle");
  const [crawlError, setCrawlError] = useState<{ company?: string; job?: string }>({});

  const crawl = async (type: "company" | "job") => {
    const url = type === "company" ? value.companyUrl : value.jobUrl;
    if (!url) return;

    const setCrawl = type === "company" ? setCompanyCrawl : setJobCrawl;

    setCrawl("loading");
    setCrawlError((prev) => ({ ...prev, [type]: undefined }));

    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCrawl("error");
        setCrawlError((prev) => ({ ...prev, [type]: data.error }));
        return;
      }

      onChange(
        type === "company"
          ? { ...value, companyContent: data.text, favicon: data.favicon }
          : { ...value, jobContent: data.text }
      );
      setCrawl("success");
    } catch {
      setCrawl("error");
      setCrawlError((prev) => ({ ...prev, [type]: "네트워크 오류가 발생했습니다." }));
    }
  };

  const URLInput = ({
    type,
    label,
    placeholder,
    crawlState,
    error,
    required,
  }: {
    type: "company" | "job";
    label: string;
    placeholder: string;
    crawlState: CrawlState;
    error?: string;
    required?: boolean;
  }) => {
    const urlValue = type === "company" ? value.companyUrl : value.jobUrl;
    const isLoaded = type === "company" ? !!value.companyContent : !!value.jobContent;

    return (
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Label className="block text-sm font-medium text-gray-700">{label}</Label>
          {required ? (
            <span className="text-xs font-medium text-red-500">필수</span>
          ) : (
            <span className="text-xs text-muted-foreground/70">선택</span>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={urlValue ?? ""}
              onChange={(e) =>
                onChange(
                  type === "company"
                    ? { ...value, companyUrl: e.target.value, companyContent: undefined }
                    : { ...value, jobUrl: e.target.value, jobContent: undefined }
                )
              }
              placeholder={placeholder}
              className="pl-8 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => crawl(type)}
            disabled={!urlValue || crawlState === "loading"}
            className="shrink-0 text-xs"
          >
            {crawlState === "loading" ? <Loader2 size={13} className="animate-spin" /> : "불러오기"}
          </Button>
        </div>

        {/* 상태 표시 */}
        {crawlState === "success" && isLoaded && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle size={12} />
            내용을 성공적으로 불러왔습니다.
          </div>
        )}
        {crawlState === "error" && error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <XCircle size={12} />
            {error}
          </div>
        )}
        {urlValue && !isLoaded && crawlState === "idle" && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">→</span>
            <span>"불러오기"를 눌러야 AI가 내용을 분석할 수 있습니다.</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-primary">회사 정보</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          채용 공고 URL은 필수입니다. 회사 소개 URL은 선택 사항입니다.
        </p>
      </div>

      <div className={cn("space-y-5 rounded-2xl border border-border bg-background p-6")}>
        <URLInput
          type="job"
          label="채용 공고 URL"
          placeholder="https://wanted.co.kr/wd/123456"
          crawlState={jobCrawl}
          error={crawlError.job}
          required
        />

        <URLInput
          type="company"
          label="회사 소개 URL"
          placeholder="https://company.com/about"
          crawlState={companyCrawl}
          error={crawlError.company}
        />
      </div>

      {/* 안내 */}
      <p className="text-xs text-muted-foreground/70">
        일부 사이트는 크롤링이 제한될 수 있습니다. 불러오기에 실패하면 해당 내용을 AI가 분석하지
        못할 수 있습니다.
      </p>
    </div>
  );
}
