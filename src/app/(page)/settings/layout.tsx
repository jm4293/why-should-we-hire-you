import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "설정",
  description: "AI API 키를 등록하고 면접관 페르소나를 설정합니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
