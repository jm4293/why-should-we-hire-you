"use client";

import { Monitor } from "lucide-react";

export function MobileGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 모바일 안내 */}
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 md:hidden">
        <Monitor size={40} className="text-muted-foreground/50" />
        <h2 className="text-primary text-xl font-semibold">데스크탑에서 이용하세요</h2>
        <p className="text-muted-foreground text-center text-sm leading-relaxed">
          이 서비스는 넓은 화면에서 최적화되어 있습니다.
          <br />
          PC 또는 노트북에서 접속해주세요.
        </p>
      </div>
      {/* 데스크탑 */}
      <div className="hidden md:flex md:h-screen md:flex-col">{children}</div>
    </>
  );
}
