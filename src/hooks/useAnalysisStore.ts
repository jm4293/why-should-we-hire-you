import { create } from "zustand";
import type { AnalysisInput, InterviewerResult } from "@/types";

interface AnalysisStore {
  // 현재 입력 데이터
  input: Partial<AnalysisInput>;
  setInput: (input: Partial<AnalysisInput>) => void;
  updateInput: (partial: Partial<AnalysisInput>) => void;

  // 현재 스텝
  currentStep: number;
  setStep: (step: number) => void;

  // 결과
  results: InterviewerResult[];
  setResults: (results: InterviewerResult[]) => void;
  updateResult: (personaId: string, partial: Partial<InterviewerResult>) => void;

  // 분석 상태
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;

  // 초기화
  reset: () => void;
}

const initialState = {
  input: {},
  currentStep: 1,
  results: [],
  isAnalyzing: false,
};

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  ...initialState,

  setInput: (input) => set({ input }),
  updateInput: (partial) => set((state) => ({ input: { ...state.input, ...partial } })),

  setStep: (step) => set({ currentStep: step }),

  setResults: (results) => set({ results }),
  updateResult: (personaId, partial) =>
    set((state) => ({
      results: state.results.map((r) => (r.personaId === personaId ? { ...r, ...partial } : r)),
    })),

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  reset: () => set(initialState),
}));
