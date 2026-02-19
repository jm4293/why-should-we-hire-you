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
    const message = err instanceof Error ? err.message : "키 확인 실패";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
