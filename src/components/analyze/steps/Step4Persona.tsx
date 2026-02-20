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
  openai: "bg-muted text-gray-700",
  anthropic: "bg-muted text-gray-700",
  google: "bg-muted text-gray-700",
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

// 내부에서 enabled 플래그를 포함한 타입
interface PersonaSlot extends Persona {
  enabled: boolean;
}

interface Step4PersonaProps {
  value: Persona[];
  onChange: (value: Persona[]) => void;
}

export function Step4Persona({ value, onChange }: Step4PersonaProps) {
  const apiKeys = getAllAPIKeys();
  const noKeys = apiKeys.length === 0;

  // 슬롯: API 키마다 1개씩. enabled 여부를 로컬로 관리.
  const buildSlots = (): PersonaSlot[] =>
    apiKeys.map((k) => {
      const existing = value.find((p) => p.provider === k.provider);
      const alreadyEnabled = value.some((p) => p.provider === k.provider);
      return {
        id: existing?.id ?? crypto.randomUUID(),
        name: existing?.name ?? "",
        role: existing?.role ?? "",
        description: existing?.description ?? "",
        provider: k.provider,
        model: k.model,
        // value에 이미 있는 경우만 활성화 (기본값: 모두 미선택)
        enabled: alreadyEnabled,
      };
    });

  const [slots, setSlots] = useState<PersonaSlot[]>(buildSlots);
  const [savedPersonas, setSavedPersonas] = useState<Persona[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(() => slots[0]?.id ?? null);

  // slots 변경 시 부모에 활성화된 것만 전달
  const syncToParent = (nextSlots: PersonaSlot[]) => {
    onChange(
      nextSlots
        .filter((s) => s.enabled)
        .map(
          (s) =>
            ({
              id: s.id,
              name: s.name,
              role: s.role,
              description: s.description,
              provider: s.provider,
              model: s.model,
            }) as Persona
        )
    );
  };

  useEffect(() => {
    // 최초 마운트 시 부모에 초기 활성화 실동 전달
    syncToParent(slots);
    getAllPersonas().then(setSavedPersonas);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSlot = (id: string, partial: Partial<PersonaSlot>) => {
    const next = slots.map((s) => (s.id === id ? { ...s, ...partial } : s));
    setSlots(next);
    syncToParent(next);
  };

  const toggleEnabled = (id: string) => {
    const next = slots.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSlots(next);
    syncToParent(next);
  };

  const handleSavePersona = async (slot: PersonaSlot) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { enabled, ...persona } = slot;
    await savePersona(persona as Persona);
    setSavedPersonas(await getAllPersonas());
  };

  const handleDeleteSaved = async (id: string) => {
    await deletePersona(id);
    setSavedPersonas(await getAllPersonas());
  };

  const applyExample = (id: string, example: (typeof PERSONA_EXAMPLES)[0]) => {
    updateSlot(id, {
      name: example.name,
      role: example.name,
      description: example.description,
    });
  };

  if (noKeys) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">AI 면접관 설정</h2>
        </div>
        <div className="rounded-2xl border border-border bg-muted/50 p-6 text-center">
          <Info size={24} className="mx-auto mb-3 text-muted-foreground/70" />
          <p className="text-sm font-medium text-primary/90">등록된 API 키가 없습니다.</p>
          <p className="mt-1 text-xs text-muted-foreground">설정 페이지에서 API 키를 먼저 등록해주세요.</p>
          <Link
            href="/settings"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-gray-700"
          >
            설정 페이지 이동
          </Link>
        </div>
      </div>
    );
  }

  const enabledCount = slots.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-primary">AI 면접관 설정</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          사용할 면접관을 선택하고, 각 면접관이 어떤 기준으로 이력서를 볼지 설정하세요.
        </p>
      </div>

      {/* 이전에 저장한 설정 */}
      {savedPersonas.length > 0 && (
        <div className="rounded-2xl border border-border bg-muted/50 p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">이전에 저장한 설정</p>
          <div className="flex flex-wrap gap-2">
            {savedPersonas.map((sp) => (
              <div key={sp.id} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const target = slots.find((s) => s.provider === sp.provider);
                    if (target) {
                      updateSlot(target.id, {
                        name: sp.name,
                        role: sp.role,
                        description: sp.description,
                        enabled: true,
                      });
                    }
                  }}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:border-gray-400"
                >
                  {sp.name} ({PROVIDER_LABELS[sp.provider]})
                </button>
                <button
                  onClick={() => handleDeleteSaved(sp.id)}
                  className="text-muted-foreground/50 hover:text-muted-foreground"
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
        {slots.map((slot, idx) => {
          const isExpanded = expandedId === slot.id;
          const isLast = enabledCount <= 1 && slot.enabled;

          return (
            <div
              key={slot.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-background transition-opacity",
                slot.enabled ? "border-border" : "border-border/50 opacity-50"
              )}
            >
              {/* 헤더 */}
              <div className="flex w-full items-center gap-3 px-5 py-4">
                {/* 선택 토글 */}
                <button
                  type="button"
                  onClick={() => toggleEnabled(slot.id)}
                  disabled={isLast}
                  title={isLast ? "최소 1명의 면접관이 필요합니다" : ""}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    slot.enabled
                      ? "border-gray-900 bg-primary text-primary-foreground"
                      : "border-border bg-background",
                    isLast && "cursor-not-allowed opacity-50"
                  )}
                >
                  {slot.enabled && (
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* 헤더 클릭 영역 */}
                <button
                  className="flex flex-1 items-center gap-3 text-left"
                  onClick={() => slot.enabled && setExpandedId(isExpanded ? null : slot.id)}
                  disabled={!slot.enabled}
                >
                  <span className="text-sm font-medium text-muted-foreground/70">
                    면접관 {idx + 1}{" "}
                    <span className="text-xs font-normal opacity-70">({slot.model})</span>
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-sm font-semibold",
                      slot.name ? "text-primary" : "text-muted-foreground/70"
                    )}
                  >
                    {slot.enabled ? slot.name || "직책 / 역할을 입력하세요" : "비활성화"}
                  </span>
                  <Badge
                    className={cn("text-xs font-medium", PROVIDER_COLORS[slot.provider])}
                    variant="secondary"
                  >
                    {PROVIDER_LABELS[slot.provider]}
                  </Badge>
                  {slot.enabled &&
                    (isExpanded ? (
                      <ChevronUp size={15} className="text-muted-foreground/70" />
                    ) : (
                      <ChevronDown size={15} className="text-muted-foreground/70" />
                    ))}
                </button>
              </div>

              {/* 펼쳐진 내용 */}
              {isExpanded && slot.enabled && (
                <div className="space-y-4 border-t border-border/50 px-5 pt-4 pb-5">
                  {/* 빠르게 선택하기 */}
                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">빠르게 선택하기</p>
                    <div className="flex flex-wrap gap-2">
                      {PERSONA_EXAMPLES.map((ex) => (
                        <button
                          key={ex.name}
                          onClick={() => applyExample(slot.id, ex)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs transition-colors",
                            slot.name === ex.name
                              ? "border-gray-900 bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:border-gray-400"
                          )}
                        >
                          {ex.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1.5 text-xs text-muted-foreground">직책 / 역할</Label>
                    <Input
                      value={slot.name}
                      onChange={(e) => updateSlot(slot.id, { name: e.target.value })}
                      placeholder="예: 시니어 개발자, HR 담당자, 팀장"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="mb-1.5 text-xs text-muted-foreground">
                      이 면접관은 무엇을 중점으로 평가하나요?
                    </Label>
                    <Textarea
                      value={slot.description}
                      onChange={(e) =>
                        updateSlot(slot.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="예: 기술 스택과 실무 경험을 중심으로 채용 공고 요구사항과의 적합도를 평가합니다."
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground/70">
                      사용 모델: <span className="text-muted-foreground">{slot.model}</span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSavePersona(slot)}
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

      {/* 안내 문구 */}
      <p className="text-xs text-muted-foreground/70">
        ✓ 선택된 면접관: <span className="font-medium text-muted-foreground">{enabledCount}명</span>
        {value.some((p) => !p.name) && (
          <span className="ml-2 text-red-400">
            · 직책/역할을 입력해야 다음으로 넘어갈 수 있습니다.
          </span>
        )}
      </p>
    </div>
  );
}
