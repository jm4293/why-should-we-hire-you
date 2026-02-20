import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import type { AIProvider } from "@/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { provider, apiKey, model } = (await req.json()) as {
    provider: AIProvider;
    apiKey: string;
    model: string;
  };

  if (!provider || !apiKey || !model) {
    return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
  }

  try {
    if (provider === "openai") {
      const openai = createOpenAI({ apiKey });
      await generateText({ model: openai(model), prompt: "hi", maxOutputTokens: 20 });
    } else if (provider === "anthropic") {
      const anthropic = createAnthropic({ apiKey });
      await generateText({
        model: anthropic(model),
        prompt: "hi",
        maxOutputTokens: 20,
      });
    } else if (provider === "google") {
      const google = createGoogleGenerativeAI({ apiKey });
      await generateText({ model: google(model), prompt: "hi", maxOutputTokens: 20 });
    } else {
      return NextResponse.json({ error: "지원하지 않는 제공자입니다." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";

    let message = "키 확인에 실패했습니다.";
    if (/quota|rate.?limit|429|free_tier/i.test(raw)) {
      message = "API 사용 한도를 초과했습니다. 플랜 및 결제 정보를 확인해주세요.";
    } else if (/invalid.?api.?key|incorrect.?api.?key|401|unauthorized|authentication/i.test(raw)) {
      message = "유효하지 않은 API 키입니다. 키를 다시 확인해주세요.";
    } else if (/not.?found|model|404/i.test(raw)) {
      message = "선택한 모델을 찾을 수 없습니다. 다른 모델을 선택해주세요.";
    } else if (/network|fetch|ENOTFOUND|ECONNREFUSED/i.test(raw)) {
      message = "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
