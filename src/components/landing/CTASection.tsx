"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: contentRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-primary px-6 py-32">
      <div ref={contentRef} className="mx-auto max-w-2xl text-center" style={{ opacity: 0 }}>
        <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground/70 uppercase">
          시작하기
        </p>
        <h2 className="mb-6 text-4xl font-semibold tracking-tight text-primary-foreground md:text-5xl">
          이번 서류는
          <br />
          다르게 준비하세요
        </h2>
        <p className="mx-auto mb-12 max-w-md text-lg leading-relaxed text-muted-foreground/70">
          AI 면접관의 시각으로 이력서를 점검하고, 채용 공고에 맞는 자소서를 작성해보세요.
        </p>

        <button
          onClick={() => (window.location.href = "/analyze")}
          className={cn(
            "rounded-full bg-background px-10 py-4 text-base font-medium text-primary",
            "transition-all duration-200 hover:bg-muted active:scale-95"
          )}
        >
          분석 시작하기
        </button>

        <p className="mt-6 text-sm text-muted-foreground">
          별도 회원가입 없이 API 키만 있으면 바로 사용할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
