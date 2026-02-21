import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { GlobalModalProvider } from "@/components/modals/GlobalModalProvider";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://whyhireyou.kr";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Why Should We Hire You?",
    template: "%s | Why Should We Hire You?",
  },
  description:
    "AI 면접관이 이력서와 포트폴리오를 분석해 서류 합격 가능성을 높여드립니다. 10년 경력 면접관 시각으로 맞춤 피드백을 받아보세요.",
  keywords: [
    "이력서 분석",
    "AI 면접관",
    "서류 합격",
    "자소서 작성",
    "취업 준비",
    "포트폴리오 분석",
    "채용 공고 분석",
  ],
  authors: [{ name: "Why Should We Hire You?" }],
  creator: "Why Should We Hire You?",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "Why Should We Hire You?",
    title: "Why Should We Hire You? — AI 면접관이 이력서를 분석합니다",
    description:
      "AI 면접관이 이력서와 포트폴리오를 분석해 서류 합격 가능성을 높여드립니다. 10년 경력 면접관 시각으로 맞춤 피드백을 받아보세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Why Should We Hire You? — AI 면접관 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Why Should We Hire You? — AI 면접관이 이력서를 분석합니다",
    description: "AI 면접관이 이력서와 포트폴리오를 분석해 서류 합격 가능성을 높여드립니다.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "manifest", url: "/manifest.json" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="font-[Pretendard] antialiased">
        <GlobalModalProvider />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
