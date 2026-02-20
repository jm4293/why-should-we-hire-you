"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saveAPIKey, getAPIKey, removeAPIKey, DEFAULT_MODELS } from "@/lib/storage/api-keys";
import type { ProviderConfig } from "./provider-config";

interface APIKeyFormItemProps {
  config: ProviderConfig;
  onSaved: () => void;
}

export function APIKeyFormItem({ config, onSaved }: APIKeyFormItemProps) {
  const [saved, setSaved] = useState<ReturnType<typeof getAPIKey>>(null);

  const [key, setKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODELS[config.provider]);
  const [showKey, setShowKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [testMessage, setTestMessage] = useState("");

  // 클라이언트 마운트 후에만 localStorage 읽기 (hydration 불일치 방지)
  useEffect(() => {
    const data = getAPIKey(config.provider);
    setSaved(data);
    if (data?.model) setModel(data.model);
  }, [config.provider]);

  const hasSaved = !!saved;

  const handleTest = async () => {
    const keyToTest = key || saved?.key || "";
    if (!keyToTest) {
      setTestResult("error");
      setTestMessage("API 키를 입력해주세요.");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: keyToTest,
          model,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult("success");
        setTestMessage("키가 정상적으로 확인됐습니다.");
      } else {
        setTestResult("error");
        setTestMessage(data.error || "키 확인에 실패했습니다.");
      }
    } catch {
      setTestResult("error");
      setTestMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const keyToSave = key || saved?.key || "";
    if (!keyToSave) return;
    saveAPIKey(config.provider, keyToSave, model);
    setSaved({ key: keyToSave, model, provider: config.provider }); // ← 즉시 상태 업데이트로 재렌더링 유발
    setKey("");
    setTestResult(null);
    onSaved();
  };

  const handleRemove = () => {
    removeAPIKey(config.provider);
    setSaved(null);
    setKey("");
    setTestResult(null);
    onSaved();
  };

  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      {/* 헤더 */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-primary">{config.label}</h3>
            {hasSaved ? (
              <Badge variant="outline" className="border-border bg-muted/50 text-xs text-muted-foreground">
                등록됨
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="animate-pulse border-red-200 bg-red-50 text-xs font-semibold text-red-600"
              >
                미등록
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{config.description}</p>
          {!hasSaved && (
            <p className="mt-1 text-xs text-muted-foreground/70">이 키를 등록하면 면접관 1명이 추가됩니다.</p>
          )}
        </div>
        <button
          onClick={() => setShowGuide((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-gray-700"
        >
          발급 방법
          <ExternalLink size={12} />
        </button>
      </div>

      {/* 발급 가이드 */}
      {showGuide && (
        <div className="mb-5 rounded-xl bg-muted/50 p-4">
          <p className="mb-3 text-xs font-medium text-gray-700">API 키 발급 방법</p>
          <ol className="space-y-1.5">
            {config.guideSteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                <span className="shrink-0 font-medium text-gray-700">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <a
            href={config.guideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-700 hover:underline"
          >
            {config.guideUrl.replace("https://", "")}
            <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* 저장된 키 표시 */}
      {hasSaved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
          <CheckCircle size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">등록된 키: {"●".repeat(12)}</span>
          <span className="ml-auto text-xs text-muted-foreground/70">{saved.model}</span>
        </div>
      )}

      {/* API 키 입력 (미등록 시만 표시) */}
      {!hasSaved && (
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">API 키</Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if (testResult) setTestResult(null);
                }}
                placeholder={config.keyPlaceholder}
                className="bg-background pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* 모델 선택 */}
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">모델</Label>
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                if (testResult) setTestResult(null);
              }}
              className={cn(
                "border-input w-full rounded-md border bg-background px-3 py-2 text-sm",
                "focus:ring-ring focus:ring-2 focus:outline-none"
              )}
            >
              {config.models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* 테스트 결과 */}
          {testResult && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                testResult === "success" ? "bg-muted/50 text-gray-700" : "bg-muted text-gray-700"
              )}
            >
              {testResult === "success" ? (
                <CheckCircle size={13} className="text-muted-foreground" />
              ) : (
                <XCircle size={13} className="text-muted-foreground" />
              )}
              {testMessage}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testing || !key}
              className="flex-1 bg-background text-xs"
            >
              {testing ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  확인 중
                </>
              ) : (
                "키 유효성 테스트"
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={testResult !== "success" || testing}
              className="flex-1 text-xs"
            >
              저장
            </Button>
          </div>
        </div>
      )}

      {/* 등록된 경우: 삭제 버튼만 표시 */}
      {hasSaved && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          className="w-full text-xs text-red-500 hover:border-red-300 hover:text-red-700"
        >
          삭제
        </Button>
      )}
    </div>
  );
}
