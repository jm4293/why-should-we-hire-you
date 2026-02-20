import type { AIProvider } from "@/types";

export interface ProviderConfig {
  provider: AIProvider;
  label: string;
  description: string;
  guideUrl: string;
  guideSteps: string[];
  models: { value: string; label: string }[];
  keyPlaceholder: string;
}

export const PROVIDERS: ProviderConfig[] = [
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
      { value: "gpt-5.2-pro", label: "gpt-5.2-pro" },
      { value: "gpt-5.2", label: "gpt-5.2 (권장)" },
      { value: "gpt-5.1", label: "gpt-5.1" },
    ],
    keyPlaceholder: "sk-...",
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
      // { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    ],
    keyPlaceholder: "sk-ant-...",
  },
  {
    provider: "google",
    label: "Google (Gemini)",
    description: "Gemini 2.5 등 Google 모델을 사용합니다.",
    guideUrl: "https://aistudio.google.com/app/apikey",
    guideSteps: [
      "aistudio.google.com 에 접속해 로그인합니다.",
      "Get API key 버튼을 클릭합니다.",
      "Create API key 를 선택합니다.",
      "생성된 키를 복사해 아래에 붙여넣습니다.",
    ],
    models: [
      { value: "gemini-3-pro-preview", label: "gemini-3-pro" },
      { value: "gemini-3-flash-preview", label: "gemini-3-flash (권장)" },
      { value: "gemini-2.5-pro", label: "Gemini-2.5-pro" },
      { value: "gemini-2.5-flash", label: "Gemini-2.5-flash" },
    ],
    keyPlaceholder: "AIza...",
  },
];
