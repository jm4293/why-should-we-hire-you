"use client";

import { useEffect, useState } from "react";
import { Save, Trash2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAllAPIKeys } from "@/lib/storage/api-keys";
import { getAllPersonas, savePersona, deletePersona } from "@/lib/storage/db";
import type { Persona, AIProvider } from "@/types";
import Link from "next/link";

const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI",
  anthropic: "Claude",
  google: "Gemini",
};

const PROVIDER_COLORS: Record<AIProvider, string> = {
  openai: "bg-gray-100 text-gray-700",
  anthropic: "bg-gray-200 text-gray-700",
  google: "bg-gray-900 text-white",
};

const PERSONA_EXAMPLES = [
  {
    name: "직무 전문가",
    description:
      "10년차 시니어 개발자로, 지원자의 기술 스택과 실무 경험을 중심으로 채용 공고의 요구 역량과 얼마나 맞는지 평가합니다.",
  },
  {
    name: "HR 담당자",
    description:
      "인사팀 소속으로, 이직 주기, 조직 문화 적합성, 협업 경험, 커뮤니케이션 능력 등을 중심으로 평가합니다.",
  },
  {
    name: "팀장",
    description:
      "실무 팀장으로, 지원자의 성장 가능성, 자기주도 학습 능력, 온보딩 가능 여부를 중심으로 평가합니다.",
  },
];

interface Step4PersonaProps {
  value: Persona[];
  onChange: (value: Persona[]) => void;
}

export function Step4Persona({ value, onChange }: Step4PersonaProps) {
  const apiKeys = getAllAPIKeys();
  const noKeys = apiKeys.length === 0;

  // value가 비어있으면 마운트 전에 defaults를 만들어 초기 expandedId 계산
  const initialDefaults =
    value.length === 0 && !noKeys
      ? apiKeys.map((k) => ({
          id: crypto.randomUUID(),
          name: "",
          role: "",
          description: "",
          provider: k.provider,
          model: k.model,
        }))
      : null;

  const [savedPersonas, setSavedPersonas] = useState<Persona[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(
    () => value[0]?.id ?? initialDefaults?.[0]?.id ?? null
  );

  useEffect(() => {
    if (initialDefaults) {
      onChange(initialDefaults as Persona[]);
    }
    getAllPersonas().then(setSavedPersonas);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updatePersona = (id: string, partial: Partial<Persona>) => {
    onChange(value.map((p) => (p.id === id ? { ...p, ...partial } : p)));
  };

  const handleSavePersona = async (persona: Persona) => {
    await savePersona(persona);
    setSavedPersonas(await getAllPersonas());
  };

  const handleDeleteSaved = async (id: string) => {
    await deletePersona(id);
    setSavedPersonas(await getAllPersonas());
  };

  const applyExample = (id: string, example: (typeof PERSONA_EXAMPLES)[0]) => {
    updatePersona(id, {
      name: example.name,
      role: example.name,
      description: example.description,
    });
  };

  if (noKeys) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI 면접관 설정</h2>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
          <Info size={24} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-800">등록된 API 키가 없습니다.</p>
          <p className="mt-1 text-xs text-gray-500">설정 페이지에서 API 키를 먼저 등록해주세요.</p>
          <Link
            href="/settings"
            className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            설정 페이지 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">AI 면접관 설정</h2>
        <p className="mt-1 text-sm text-gray-500">
          등록된 API 키 수만큼 면접관이 생성됩니다. 각 면접관이 어떤 기준으로 이력서를 볼지
          설정하세요.
        </p>
      </div>

      {/* 이전에 저장한 설정 */}
      {savedPersonas.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-xs font-medium text-gray-600">이전에 저장한 설정</p>
          <div className="flex flex-wrap gap-2">
            {savedPersonas.map((sp) => (
              <div key={sp.id} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const target = value.find((v) => v.provider === sp.provider);
                    if (target) {
                      updatePersona(target.id, {
                        name: sp.name,
                        role: sp.role,
                        description: sp.description,
                      });
                    }
                  }}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 hover:border-gray-400"
                >
                  {sp.name} ({PROVIDER_LABELS[sp.provider]})
                </button>
                <button
                  onClick={() => handleDeleteSaved(sp.id)}
                  className="text-gray-300 hover:text-gray-600"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 면접관 카드 */}
      <div className="space-y-3">
        {value.map((persona, idx) => {
          const isExpanded = expandedId === persona.id;
          return (
            <div
              key={persona.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              {/* 헤더 */}
              <button
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
                onClick={() => setExpandedId(isExpanded ? null : persona.id)}
              >
                <span className="text-sm font-medium text-gray-400">면접관 {idx + 1}</span>
                <span
                  className={cn(
                    "flex-1 text-sm font-semibold",
                    persona.name ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {persona.name || "직책 / 역할을 입력하세요"}
                </span>
                <Badge
                  className={cn("text-xs font-medium", PROVIDER_COLORS[persona.provider])}
                  variant="secondary"
                >
                  {PROVIDER_LABELS[persona.provider]}
                </Badge>
                {isExpanded ? (
                  <ChevronUp size={15} className="text-gray-400" />
                ) : (
                  <ChevronDown size={15} className="text-gray-400" />
                )}
              </button>

              {/* 펼쳐진 내용 */}
              {isExpanded && (
                <div className="space-y-4 border-t border-gray-100 px-5 pt-4 pb-5">
                  {/* 빠르게 선택하기 */}
                  <div>
                    <p className="mb-2 text-xs text-gray-500">빠르게 선택하기</p>
                    <div className="flex flex-wrap gap-2">
                      {PERSONA_EXAMPLES.map((ex) => (
                        <button
                          key={ex.name}
                          onClick={() => applyExample(persona.id, ex)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs transition-colors",
                            persona.name === ex.name
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 text-gray-500 hover:border-gray-400"
                          )}
                        >
                          {ex.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1.5 text-xs text-gray-600">직책 / 역할</Label>
                    <Input
                      value={persona.name}
                      onChange={(e) => updatePersona(persona.id, { name: e.target.value })}
                      placeholder="예: 시니어 개발자, HR 담당자, 팀장"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="mb-1.5 text-xs text-gray-600">
                      이 면접관은 무엇을 중점으로 평가하나요?
                    </Label>
                    <Textarea
                      value={persona.description}
                      onChange={(e) =>
                        updatePersona(persona.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="예: 기술 스택과 실무 경험을 중심으로 채용 공고 요구사항과의 적합도를 평가합니다."
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      사용 모델: <span className="text-gray-600">{persona.model}</span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSavePersona(persona)}
                      className="gap-1.5 text-xs"
                    >
                      <Save size={12} />
                      다음에도 재사용
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
