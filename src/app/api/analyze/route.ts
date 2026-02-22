import { NextRequest } from "next/server";

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import type { AnalysisInput, Persona, CoverLetterItem } from "@/types";

export const maxDuration = 30;

function buildAnalysisPrompt(input: AnalysisInput, persona: Persona): string {
  const { companyInfo, resumeFiles = [] } = input;

  const resumeText = resumeFiles
    .map((f) => `[${f.type === "resume" ? "이력서" : "추가 서류"} - ${f.name}]\n${f.text}`)
    .join("\n\n");

  return `당신은 ${persona.description}입니다.

아래 회사 정보와 지원자 서류를 바탕으로, 지원자를 왜 채용해야 하는지 또는 왜 채용하기 어려운지 엄격하고 객관적으로 분석해주세요.

[중요 지침]
1. 지원자의 서류 내용에 없는 사실, 경험, 또는 기술을 절대 지어내거나 과장하여 채용 공고에 억지로 끼워 맞추지 마세요. 무조건적으로 긍정적인 평가를 하는 것은 허용되지 않습니다.
2. 분석 결과, 지원자의 직무 경험이나 역량이 채용 공고의 요구 조건과 일치하는 직무가 없거나 기준에 미달한다면, 객관적으로 판단하여 "해당 채용 공고에 지원하기에는 직무 적합성/역량이 부족하다"고 명확하고 솔직하게 알려주세요.

---

[회사 소개]
${companyInfo.companyContent || "(정보 없음)"}

[채용 공고]
${companyInfo.jobContent || "(정보 없음)"}

[지원자 서류]
${resumeText}

---

아래 형식으로 반드시 한국어로 작성해주세요. 강조된 단어, 오바스러운 표현, 감탄사는 사용하지 마세요.

## 1. 종합 평가
(한두 문장으로 이 지원자에 대한 전반적인 인상을 서술하세요)

## 2. 이 회사에 적합한 이유
- (항목별로 작성)

## 3. 부족하거나 보완이 필요한 점
- (항목별로 작성)

## 4. 이력서/포트폴리오 수정 제안
아래 형식으로 수정이 필요한 항목을 작성하세요:
**원문:** (원래 내용)
**수정 제안:** (개선된 내용)
**이유:** (수정이 필요한 이유)`;
}

function buildCoverLetterPrompt(input: AnalysisInput, persona: Persona): string {
  const { companyInfo, resumeFiles = [], coverLetterItems = [] } = input;

  const resumeText = resumeFiles
    .map((f) => `[${f.type === "resume" ? "이력서" : "추가 서류"} - ${f.name}]\n${f.text}`)
    .join("\n\n");

  const coverLetterQuestions = coverLetterItems
    .map(
      (item: CoverLetterItem, idx: number) =>
        `자소서 문항 ${idx + 1} (최대 ${item.maxLength}자): ${item.question}`
    )
    .join("\n");

  return `당신은 ${persona.description}입니다.

아래 회사 정보와 지원자 서류를 바탕으로 자소서 초안을 작성해주세요.

[회사 소개]
${companyInfo.companyContent || "(정보 없음)"}

[채용 공고]
${companyInfo.jobContent || "(정보 없음)"}

[지원자 서류]
${resumeText}

---

## 5. 자소서 초안

다음 각 문항에 대해 답변을 작성해주세요. 각 문항은 소제목을 포함한 여러 단락으로 나눠서 작성하세요.
소제목은 면접관이 읽었을 때 흥미를 유발할 수 있어야 하며, 강조된 단어나 감탄사는 사용하지 마세요.
글자 수 제한을 반드시 지켜주세요.

${coverLetterQuestions}`;
}

export async function POST(req: NextRequest) {
  // 간단한 내부 서비스 검증 (외부에서 직접 호출하는 것을 방지)
  const internalKey = req.headers.get("x-internal-service-key");
  const expectedKey =
    process.env.INTERNAL_SERVICE_KEY || "why-should-we-hire-you-internal-key-2026";

  if (internalKey !== expectedKey) {
    return new Response(JSON.stringify({ error: "Unauthorized access." }), { status: 401 });
  }

  const { input, persona, apiKey, phase } = await req.json();

  if (!apiKey || !persona || !input) {
    return new Response(JSON.stringify({ error: "필수 데이터가 없습니다." }), { status: 400 });
  }

  // phase: "analysis" (1~4번) | "cover-letter" (5번) | undefined (기존 동작 - 전체)
  const isCoverLetter = phase === "cover-letter";
  const prompt = isCoverLetter
    ? buildCoverLetterPrompt(input, persona)
    : buildAnalysisPrompt(input, persona);

  try {
    let result;

    if (persona.provider === "openai") {
      const openai = createOpenAI({ apiKey });
      result = streamText({
        model: openai(persona.model),
        prompt,
        maxOutputTokens: 4000,
      });
    } else if (persona.provider === "anthropic") {
      const anthropic = createAnthropic({ apiKey });
      result = streamText({
        model: anthropic(persona.model),
        prompt,
        maxOutputTokens: 4000,
      });
    } else if (persona.provider === "google") {
      const google = createGoogleGenerativeAI({ apiKey });
      result = streamText({
        model: google(persona.model),
        prompt,
        maxOutputTokens: 8000,
      });
    } else {
      return new Response(JSON.stringify({ error: "지원하지 않는 AI 제공자입니다." }), {
        status: 400,
      });
    }

    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
