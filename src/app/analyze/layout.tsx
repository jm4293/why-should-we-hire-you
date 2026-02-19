import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이력서 분석",
  description: "AI 면접관이 이력서와 채용 공고를 분석해 맞춤 피드백을 제공합니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
