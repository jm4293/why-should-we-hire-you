"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const interviewers = [
  {
    label: "AI 면접관 A",
    role: "직무 전문가",
    provider: "OpenAI",
    color: "bg-background border-border",
    accent: "text-primary",
    quote:
      "React 경험은 충분하지만 TypeScript 실무 경험이 보이지 않습니다. 요구 역량 중 대규모 트래픽 처리 경험도 서류에 드러나지 않네요.",
    focus: "기술 스택 · 실무 경험 · 요구 역량 충족 여부",
  },
  {
    label: "AI 면접관 B",
    role: "HR 담당자",
    provider: "Claude",
    color: "bg-muted/50 border-border",
    accent: "text-primary",
    quote:
      "이직 주기가 짧고 팀 협업 경험이 자소서에 거의 언급되지 않습니다. 우리 조직 문화와 맞는지 좀 더 확인이 필요할 것 같습니다.",
    focus: "조직 문화 · 이직 주기 · 협업 이력",
  },
  {
    label: "AI 면접관 C",
    role: "팀장",
    provider: "Gemini",
    color: "bg-primary border-primary/20",
    accent: "text-primary-foreground",
    quote:
      "사이드 프로젝트를 꾸준히 이어온 걸 보면 자기주도 학습 능력은 있어 보입니다. 부족한 부분은 온보딩 과정에서 충분히 커버할 수 있을 것 같습니다.",
    focus: "성장 가능성 · 자기주도 학습 · 온보딩 적합성",
  },
];

export function InterviewersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: titleRef.current, start: "top 80%" },
        }
      );

      gsap.fromTo(
        cardsRef.current?.children ?? [],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.18,
          scrollTrigger: { trigger: cardsRef.current, start: "top 75%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-muted/50 px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <div ref={titleRef} className="mb-6 text-center" style={{ opacity: 0 }}>
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground/70 uppercase">
            면접관 소개
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-primary md:text-5xl">
            같은 이력서,
            <br />
            다른 시각
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            등록한 AI마다 역할이 다른 면접관이 배정됩니다. 직무 전문가, HR 담당자, 팀장 관점을 모두
            받아볼 수 있습니다.
          </p>
        </div>

        <p className="mb-12 text-center text-sm text-muted-foreground/70">
          아래는 예시입니다. 실제 페르소나는 직접 설정할 수 있습니다.
        </p>

        <div ref={cardsRef} className="grid gap-6 md:grid-cols-3">
          {interviewers.map((item) => (
            <div
              key={item.label}
              className={cn("rounded-2xl border p-6", item.color)}
              style={{ opacity: 0 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground/70">{item.label}</p>
                  <p className={cn("text-base font-semibold", item.accent)}>{item.role}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    item.color.includes("gray-900")
                      ? "bg-primary/90 text-muted-foreground/50"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.provider}
                </span>
              </div>

              <blockquote
                className={cn(
                  "mb-4 text-sm leading-relaxed",
                  item.color.includes("gray-900") ? "text-muted-foreground/50" : "text-muted-foreground"
                )}
              >
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <p
                className={cn(
                  "text-xs",
                  item.color.includes("gray-900") ? "text-muted-foreground" : "text-muted-foreground/70"
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    item.color.includes("gray-900") ? "text-muted-foreground/70" : "text-muted-foreground"
                  )}
                >
                  중점 평가 :
                </span>{" "}
                {item.focus}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
