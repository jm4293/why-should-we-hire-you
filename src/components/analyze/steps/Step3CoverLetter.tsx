"use client";

import { Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CoverLetterItem } from "@/types";

const EXAMPLES = [
  {
    label: "지원 동기",
    question: "이 직무에 지원하게 된 동기와 당사에 관심을 갖게 된 계기를 작성해주세요.",
  },
  {
    label: "직무 적합성",
    question: "본인이 지원 직무에 적합한 이유를 경험과 역량 중심으로 기술해주세요.",
  },
  {
    label: "성장 목표",
    question: "입사 후 이루고 싶은 목표와 성장 계획을 구체적으로 작성해주세요.",
  },
  {
    label: "팀워크 경험",
    question: "팀 프로젝트에서 갈등을 해결하거나 협업을 이끈 경험을 서술해주세요.",
  },
  {
    label: "도전 경험",
    question: "가장 도전적인 경험과 그것을 통해 배운 점을 구체적으로 서술해주세요.",
  },
  {
    label: "강점",
    question: "본인의 가장 큰 강점이 무엇인지, 이를 직무에 어떻게 활용할 수 있는지 작성해주세요.",
  },
];

interface Step3CoverLetterProps {
  value: CoverLetterItem[];
  onChange: (value: CoverLetterItem[]) => void;
}

export function Step3CoverLetter({ value, onChange }: Step3CoverLetterProps) {
  const addItem = (question = "") => {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        question,
        maxLength: 1000,
      },
    ]);
  };

  const updateItem = (id: string, partial: Partial<CoverLetterItem>) => {
    onChange(value.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  };

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-primary text-xl font-semibold">자소서 문항</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          자소서 문항과 최대 글자 수를 입력해주세요. 문항이 없으면 건너뛸 수 있습니다.
        </p>
      </div>

      {/* 예시 문항 */}
      <div>
        <p className="text-primary/80 mb-2 text-xs font-semibold">빠르게 추가하기</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => {
            const alreadyAdded = value.some((v) => v.question === ex.question);
            return (
              <button
                key={ex.label}
                onClick={() => {
                  if (!alreadyAdded) addItem(ex.question);
                }}
                disabled={alreadyAdded}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  alreadyAdded
                    ? "bg-primary text-primary-foreground cursor-default border-gray-900"
                    : "border-border text-muted-foreground hover:border-gray-400"
                )}
              >
                {ex.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 문항 목록 */}
      <div className="space-y-4">
        {value.map((item, idx) => (
          <div key={item.id} className="border-border bg-background rounded-2xl border p-5">
            <div className="mb-3 flex items-center gap-2">
              <GripVertical size={14} className="text-muted-foreground/50" />
              <span className="text-primary/90 text-sm font-bold">문항 {idx + 1}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-muted-foreground/50 ml-auto transition-colors hover:text-gray-700"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-primary/80 mb-1.5 text-xs font-semibold">문항 내용</Label>
                <Textarea
                  value={item.question}
                  onChange={(e) => updateItem(item.id, { question: e.target.value })}
                  placeholder="자소서 문항을 입력하세요"
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-primary/80 shrink-0 text-xs font-semibold">
                  최대 글자 수
                </Label>
                <Input
                  type="number"
                  value={item.maxLength}
                  onChange={(e) =>
                    updateItem(item.id, { maxLength: Number(e.target.value) || 1000 })
                  }
                  min={100}
                  max={5000}
                  step={100}
                  className="w-28 text-sm"
                />
                <span className="text-muted-foreground/70 text-xs">자</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => addItem()}
        className="text-muted-foreground w-full border-dashed text-sm"
      >
        <Plus size={15} />
        문항 추가
      </Button>

      {value.length === 0 && (
        <p className="text-muted-foreground/70 text-center text-xs">
          문항을 추가하지 않으면 자소서 초안 섹션이 생략됩니다.
        </p>
      )}
    </div>
  );
}
