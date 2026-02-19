"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const problems = [
  {
    stat: "87%",
    desc: "지원자가 서류 탈락 이유를 모른 채 다음 지원을 준비합니다.",
  },
  {
    stat: "3초",
    desc: "면접관이 이력서 한 장에 쏟는 평균 시간입니다.",
  },
  {
    stat: "1장",
    desc: "수백 개의 경험 중 면접관이 실제로 읽는 분량입니다.",
  },
];

export function ProblemSection() {
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
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        cardsRef.current?.children ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-gray-50 px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <div ref={titleRef} className="mb-20 text-center" style={{ opacity: 0 }}>
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-gray-400 uppercase">
            문제 인식
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            서류 탈락, 이유를
            <br />
            알고 계신가요?
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-gray-500">
            매번 열심히 준비하지만 결과는 달라지지 않는다면, 방향이 잘못됐을 수 있습니다.
          </p>
        </div>

        <div ref={cardsRef} className="grid gap-6 md:grid-cols-3">
          {problems.map((item) => (
            <div
              key={item.stat}
              className="rounded-2xl bg-white p-8 shadow-sm"
              style={{ opacity: 0 }}
            >
              <p className="mb-3 text-5xl font-semibold tracking-tight text-gray-900">
                {item.stat}
              </p>
              <p className="text-base leading-relaxed text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
