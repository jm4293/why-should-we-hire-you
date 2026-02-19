"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Upload, Cpu, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "서류와 채용 공고 입력",
    desc: "이력서 PDF와 채용 공고 URL을 입력합니다. 자소서 문항과 면접관 페르소나도 설정할 수 있습니다.",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI 면접관이 동시에 분석",
    desc: "등록한 AI마다 각기 다른 관점의 면접관이 이력서와 채용 공고를 함께 분석합니다.",
  },
  {
    step: "03",
    icon: FileText,
    title: "결과 확인 및 자소서 초안",
    desc: "적합성 분석, 수정 제안, 자소서 초안을 면접관별로 확인하고 PDF로 저장합니다.",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

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
        stepsRef.current?.children ?? [],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: { trigger: stepsRef.current, start: "top 75%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <div ref={titleRef} className="mb-20 text-center" style={{ opacity: 0 }}>
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-gray-400 uppercase">
            사용 방법
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            세 단계면 충분합니다
          </h2>
        </div>

        <div ref={stepsRef} className="grid gap-8 md:grid-cols-3">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative" style={{ opacity: 0 }}>
                {/* 연결선 */}
                {idx < steps.length - 1 && (
                  <div className="absolute top-8 left-full hidden h-px w-8 bg-gray-200 md:block" />
                )}

                <div
                  className={cn(
                    "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl",
                    "bg-gray-900 text-white"
                  )}
                >
                  <Icon size={22} />
                </div>

                <p className="mb-1 text-xs font-medium tracking-widest text-gray-400">
                  STEP {item.step}
                </p>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="text-base leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
