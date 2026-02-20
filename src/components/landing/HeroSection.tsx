"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

// 수평 라인들
const LINES = Array.from({ length: 14 }, (_, i) => ({
  y: 6 + i * 7,
  dur: 6 + (i % 4) * 2.5, // 6~13초로 빠르게
  delay: -(i * 1.8),
  opacity: i % 3 === 0 ? 0.18 : i % 3 === 1 ? 0.12 : 0.08,
  width: i % 4 === 0 ? 55 : i % 4 === 1 ? 35 : i % 4 === 2 ? 45 : 40,
}));

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 라인들 왼쪽에서 오른쪽으로 무한 흐름
      linesRef.current.forEach((line, i) => {
        if (!line) return;
        const cfg = LINES[i];
        gsap.fromTo(
          line,
          { x: "-100vw" },
          {
            x: "100vw",
            duration: cfg.dur,
            delay: cfg.delay,
            ease: "none",
            repeat: -1,
          }
        );
      });

      // 텍스트 입장
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(titleRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2 })
        .fromTo(subRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center"
    >
      {/* 흐르는 라인 배경 */}
      {LINES.map((line, i) => (
        <div key={i} className="pointer-events-none absolute left-0" style={{ top: `${line.y}%` }}>
          <div
            ref={(el) => {
              linesRef.current[i] = el;
            }}
            style={{
              width: `${line.width}vw`,
              height: 1,
              background: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,${line.opacity * 3}) 20%, rgba(0,0,0,${line.opacity}) 50%, rgba(0,0,0,${line.opacity * 3}) 80%, transparent 100%)`,
            }}
          />
        </div>
      ))}

      {/* 콘텐츠 */}
      <div
        className="relative z-10 max-w-4xl rounded-3xl px-16 py-12"
        style={{
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          backgroundColor: "rgba(255,255,255,0.4)",
        }}
      >
        <p className="mb-6 text-sm font-medium tracking-[0.25em] text-muted-foreground/70 uppercase">
          AI 서류 분석 서비스
        </p>

        <h1
          ref={titleRef}
          className="mb-8 text-5xl leading-[1.1] font-semibold tracking-tight text-primary md:text-7xl"
          style={{ opacity: 0 }}
        >
          Why should
          <br />
          <span className="text-muted-foreground/70">we hire you?</span>
        </h1>

        <p
          ref={subRef}
          className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          style={{ opacity: 0 }}
        >
          AI 면접관이 이력서와 채용 공고를 함께 분석해
          <br />
          서류 합격 가능성을 높여드립니다.
        </p>

        <div ref={ctaRef} className="flex flex-col items-center gap-4" style={{ opacity: 0 }}>
          <button
            onClick={() => {
              window.location.href = "/analyze";
            }}
            className={cn(
              "rounded-full bg-primary px-10 py-4 text-base font-medium text-primary-foreground",
              "transition-all duration-200 hover:bg-gray-700 active:scale-95"
            )}
          >
            분석 시작하기
          </button>
          <p className="text-sm text-muted-foreground/70">
            API 키가 필요하며, 각 AI 서비스에서 무료로 발급받을 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
