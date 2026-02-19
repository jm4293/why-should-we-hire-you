"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "회사 정보" },
  { number: 2, label: "내 서류" },
  { number: 3, label: "자소서 문항" },
  { number: 4, label: "페르소나 설정" },
  { number: 5, label: "최종 확인" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const done = step.number < currentStep;
        const active = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center">
            {/* 스텝 원 + 라벨 */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all",
                  done && "bg-gray-900 text-white",
                  active && "bg-gray-900 text-white ring-4 ring-gray-900/10",
                  !done && !active && "bg-gray-100 text-gray-400"
                )}
              >
                {done ? <Check size={14} /> : step.number}
              </div>
              <span
                className={cn("text-xs", active ? "font-medium text-gray-900" : "text-gray-400")}
              >
                {step.label}
              </span>
            </div>

            {/* 연결선 */}
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "mb-5 h-px w-12 transition-all md:w-16",
                  done ? "bg-gray-900" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
