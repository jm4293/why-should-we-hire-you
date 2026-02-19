"use client";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saveAPIKey, getAPIKey, removeAPIKey, DEFAULT_MODELS } from "@/lib/storage/api-keys";
import type { AIProvider } from "@/types";

interface ProviderConfig {
  provider: AIProvider;
  label: string;
  description: string;
  guideUrl: string;
  guideSteps: string[];
  models: { value: string; label: string }[];
}

const PROVIDERS: ProviderConfig[] = [
  {
    provider: "openai",
    label: "OpenAI",
    description: "GPT-4o 등 OpenAI 모델을 사용합니다.",
    guideUrl: "https://platform.openai.com/api-keys",
    guideSteps: [
      "platform.openai.com 에 접속해 로그인합니다.",
      "왼쪽 메뉴에서 API keys를 클릭합니다.",
      "Create new secret key 버튼을 클릭합니다.",
      "생성된 키를 복사해 아래에 붙여넣습니다.",
    ],
    models: [
      { value: "gpt-4o", label: "GPT-4o (권장)" },
      { value: "gpt-4o-mini", label: "GPT-4o mini (저비용)" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    ],
  },
  {
    provider: "anthropic",
    label: "Anthropic (Claude)",
    description: "Claude Sonnet, Opus 등 Anthropic 모델을 사용합니다.",
    guideUrl: "https://console.anthropic.com/",
    guideSteps: [
      "console.anthropic.com 에 접속해 로그인합니다.",
      "상단 메뉴에서 API Keys를 클릭합니다.",
      "Create Key 버튼을 클릭합니다.",
      "생성된 키를 복사해 아래에 붙여넣습니다.",
    ],
    models: [
      { value: "claude-opus-4-6", label: "Claude Opus 4.6 (권장)" },
      { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      {
        value: "claude-haiku-4-5-20251001",
        label: "Claude Haiku 4.5 (저비용)",
      },
    ],
  },
  {
    provider: "google",
    label: "Google (Gemini)",
    description: "Gemini 2.0 등 Google 모델을 사용합니다.",
    guideUrl: "https://aistudio.google.com/app/apikey",
    guideSteps: [
      "aistudio.google.com 에 접속해 로그인합니다.",
      "Get API key 버튼을 클릭합니다.",
      "Create API key 를 선택합니다.",
      "생성된 키를 복사해 아래에 붙여넣습니다.",
    ],
    models: [
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (권장)" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (저비용)" },
    ],
  },
];

interface APIKeyFormItemProps {
  config: ProviderConfig;
  onSaved: () => void;
}

function APIKeyFormItem({ config, onSaved }: APIKeyFormItemProps) {
  const saved = getAPIKey(config.provider);

  const [key, setKey] = useState("");
  const [model, setModel] = useState(saved?.model ?? DEFAULT_MODELS[config.provider]);
  const [showKey, setShowKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [testMessage, setTestMessage] = useState("");

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
    setKey("");
    onSaved();
  };

  const handleRemove = () => {
    removeAPIKey(config.provider);
    setKey("");
    setTestResult(null);
    onSaved();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      {/* 헤더 */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{config.label}</h3>
            {hasSaved ? (
              <Badge variant="secondary" className="text-xs">
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
          <p className="mt-0.5 text-sm text-gray-500">{config.description}</p>
          {!hasSaved && (
            <p className="mt-1 text-xs text-gray-400">이 키를 등록하면 면접관 1명이 추가됩니다.</p>
          )}
        </div>
        <button
          onClick={() => setShowGuide((v) => !v)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
        >
          발급 방법
          <ExternalLink size={12} />
        </button>
      </div>

      {/* 발급 가이드 */}
      {showGuide && (
        <div className="mb-5 rounded-xl bg-gray-50 p-4">
          <p className="mb-3 text-xs font-medium text-gray-700">API 키 발급 방법</p>
          <ol className="space-y-1.5">
            {config.guideSteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-500">
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
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <CheckCircle size={14} className="text-gray-500" />
          <span className="text-xs text-gray-500">등록된 키: {"●".repeat(12)}</span>
          <span className="ml-auto text-xs text-gray-400">{saved.model}</span>
        </div>
      )}

      {/* API 키 입력 */}
      <div className="space-y-3">
        <div>
          <Label className="mb-1.5 text-xs text-gray-600">
            {hasSaved ? "새 API 키 (변경 시 입력)" : "API 키"}
          </Label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="bg-white pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* 모델 선택 */}
        <div>
          <Label className="mb-1.5 text-xs text-gray-600">모델</Label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={cn(
              "border-input w-full rounded-md border bg-white px-3 py-2 text-sm",
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
              testResult === "success" ? "bg-gray-50 text-gray-700" : "bg-gray-100 text-gray-700"
            )}
          >
            {testResult === "success" ? (
              <CheckCircle size={13} className="text-gray-500" />
            ) : (
              <XCircle size={13} className="text-gray-500" />
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
            disabled={testing || (!key && !hasSaved)}
            className="flex-1 bg-white text-xs"
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
            disabled={!key && !hasSaved}
            className="flex-1 text-xs"
          >
            저장
          </Button>

          {hasSaved && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              삭제
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface APIKeyFormProps {
  onSaved: () => void;
}

export function APIKeyForm({ onSaved }: APIKeyFormProps) {
  return (
    <div className="space-y-4">
      {PROVIDERS.map((config) => (
        <APIKeyFormItem key={config.provider} config={config} onSaved={onSaved} />
      ))}
    </div>
  );
}
