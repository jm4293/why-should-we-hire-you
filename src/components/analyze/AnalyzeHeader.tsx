"use client";

import { useRouter } from "next/navigation";
import { Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyzeHeaderProps {
  onNewAnalysis: () => void;
}

export function AnalyzeHeader({ onNewAnalysis }: AnalyzeHeaderProps) {
  const router = useRouter();

  return (
    <header className="border-border bg-background flex h-14 shrink-0 items-center justify-between border-b px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="text-primary hover:text-muted-foreground text-sm font-semibold"
        >
          Why Should We Hire You?
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onNewAnalysis} className="gap-1.5 text-xs">
          <Plus size={13} />새 분석
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/settings")}
          className="text-muted-foreground gap-1.5 text-xs"
        >
          <Settings size={14} />
          설정
        </Button>
      </div>
    </header>
  );
}
