"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { Step1Company } from "./steps/Step1Company";
import { Step2Resume } from "./steps/Step2Resume";
import { Step3CoverLetter } from "./steps/Step3CoverLetter";
import { Step4Persona } from "./steps/Step4Persona";
import { Step5Confirm } from "./steps/Step5Confirm";
import { useAnalysisStore } from "@/store/analysis";
import { saveDraft, getDraft, deleteDraft } from "@/lib/storage/db";
import type { AnalysisInput } from "@/types";

export function AnalyzeWizard() {
  const router = useRouter();
  const { input, currentStep, setStep, updateInput } = useAnalysisStore();

  // 임시저장 복원
  useEffect(() => {
    getDraft().then((draft) => {
      if (draft) {
        const confirmed = window.confirm(
          "이전에 작업하던 내용이 있습니다. 이어서 진행하시겠습니까?\n취소하면 새로 시작합니다."
        );
        if (confirmed) {
          updateInput({
            companyInfo: draft.companyInfo as AnalysisInput["companyInfo"],
            resumeFiles: draft.resumeFiles,
            coverLetterItems: draft.coverLetterItems,
            personas: draft.personas,
          });
          setStep(draft.step);
        } else {
          deleteDraft();
        }
      }
    });
  }, []);

  // 이탈 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 1) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentStep]);

  // 스텝 이동 시 자동 임시저장
  const autoSave = useCallback(
    async (step: number) => {
      try {
        await saveDraft({
          step,
          companyInfo: input.companyInfo ?? {},
          resumeFiles: input.resumeFiles ?? [],
          coverLetterItems: input.coverLetterItems ?? [],
          personas: input.personas ?? [],
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // 임시저장 실패는 무시
      }
    },
    [input]
  );

  const goNext = () => {
    if (!canProceed()) return;
    const next = currentStep + 1;
    setStep(next);
    autoSave(next);
  };

  const goPrev = () => {
    const prev = currentStep - 1;
    setStep(prev);
    autoSave(prev);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(input.companyInfo?.jobUrl && input.companyInfo?.jobContent);
      case 2:
        return input.resumeFiles?.some((f) => f.type === "resume") ?? false;
      case 3:
        return true; // 선택 사항
      case 4:
        return (input.personas?.length ?? 0) > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleStart = async () => {
    if (!(input.personas && input.personas.length > 0)) {
      toast.error("페르소나가 설정되지 않았습니다.");
      return;
    }

    await deleteDraft();
    router.push("/analyze/result");
  };

  return (
    <div className="flex min-h-0 flex-col">
      {/* 스텝 인디케이터 */}
      <div className="mb-8">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* 스텝 내용 */}
      <div className="flex-1 overflow-y-auto pb-6">
        {currentStep === 1 && (
          <Step1Company
            value={input.companyInfo ?? {}}
            onChange={(v) => updateInput({ companyInfo: v as AnalysisInput["companyInfo"] })}
          />
        )}
        {currentStep === 2 && (
          <Step2Resume
            value={input.resumeFiles ?? []}
            onChange={(v) => updateInput({ resumeFiles: v })}
          />
        )}
        {currentStep === 3 && (
          <Step3CoverLetter
            value={input.coverLetterItems ?? []}
            onChange={(v) => updateInput({ coverLetterItems: v })}
          />
        )}
        {currentStep === 4 && (
          <Step4Persona
            value={input.personas ?? []}
            onChange={(v) => updateInput({ personas: v })}
          />
        )}
        {currentStep === 5 && <Step5Confirm input={input} />}
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-5">
        <Button
          variant="ghost"
          onClick={goPrev}
          disabled={currentStep === 1}
          className="gap-1.5 text-sm text-gray-500"
        >
          <ChevronLeft size={15} />
          이전
        </Button>

        {currentStep < 5 ? (
          <Button onClick={goNext} disabled={!canProceed()} className="gap-1.5 text-sm">
            다음
            <ChevronRight size={15} />
          </Button>
        ) : (
          <Button onClick={handleStart} className="gap-2 bg-gray-900 text-sm hover:bg-gray-700">
            <Zap size={15} />
            분석 시작
          </Button>
        )}
      </div>
    </div>
  );
}
