"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Key, Monitor, CircleDollarSign } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const notices = [
  {
    icon: Key,
    title: "API 키가 필요합니다",
    desc: "OpenAI, Anthropic, Google 중 하나 이상의 API 키를 직접 등록해야 합니다. 키 발급 방법은 설정 페이지에서 안내합니다.",
  },
  {
    icon: Monitor,
    title: "개인 PC에서만 사용하세요",
    desc: "API 키는 이 기기의 브라우저에만 저장됩니다. 서버로 전송되지 않으며, 공용 PC에서 사용할 경우 키가 노출될 수 있습니다.",
  },
  {
    icon: CircleDollarSign,
    title: "분석 시 비용이 발생합니다",
    desc: "등록한 API 키 기준으로 분석할 때마다 소액의 비용이 청구됩니다. 면접관 1명 기준 약 $0.01~$0.10 수준입니다.",
  },
];

export function NoticeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: titleRef.current, start: "top 80%" },
        }
      );

      gsap.fromTo(
        itemsRef.current?.children ?? [],
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: itemsRef.current, start: "top 78%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white px-6 py-32">
      <div className="mx-auto max-w-3xl">
        <div ref={titleRef} className="mb-16 text-center" style={{ opacity: 0 }}>
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-gray-400 uppercase">
            사용 전 확인
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            시작 전에 알아두세요
          </h2>
        </div>

        <div ref={itemsRef} className="space-y-8">
          {notices.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-5" style={{ opacity: 0 }}>
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="mb-1.5 text-base font-semibold text-gray-900">{item.title}</p>
                  <p className="text-base leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
