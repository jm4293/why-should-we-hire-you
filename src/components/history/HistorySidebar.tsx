"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  MoreHorizontal,
  Trash2,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useHistoryStore } from "@/store/history";
import type { HistoryItem } from "@/types";

const PROVIDER_COLORS = {
  openai: "bg-muted text-muted-foreground",
  anthropic: "bg-muted text-muted-foreground",
  google: "bg-muted text-muted-foreground",
};
const PROVIDER_SHORT = { openai: "GPT", anthropic: "Claude", google: "Gemini" };

interface HistorySidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentId?: string;
  onSelect: (item: HistoryItem) => void;
}

export function HistorySidebar({ collapsed, onToggle, currentId, onSelect }: HistorySidebarProps) {
  const { items, isLoaded, load, remove, clear } = useHistoryStore();
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  if (collapsed) {
    return (
      <aside className="border-border bg-background flex h-full w-14 flex-col items-center gap-3 border-r py-4">
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:bg-muted flex h-8 w-8 items-center justify-center rounded-lg"
          title="사이드바 열기"
        >
          <PanelLeftOpen size={16} />
        </button>

        <div className="mt-2 flex flex-col gap-2">
          {items.slice(0, 8).map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              title={`${item.companyName} - ${item.jobTitle}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                currentId === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.result?.input?.companyInfo?.companyUrl ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${new URL(item.result.input.companyInfo.companyUrl).hostname}&sz=32`}
                  alt=""
                  className="h-4 w-4 rounded"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = "none";
                    el.nextElementSibling?.removeAttribute("style");
                  }}
                />
              ) : null}
              <FileText size={14} />
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="border-border bg-background flex h-full w-60 flex-col border-r">
      {/* 헤더 */}
      <div className="border-border/50 flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-medium text-gray-700">분석 히스토리</span>
        <div className="flex items-center gap-1">
          {items.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground/70 h-7 w-7 p-0">
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    if (confirmClear) {
                      clear();
                      setConfirmClear(false);
                    } else {
                      setConfirmClear(true);
                      setTimeout(() => setConfirmClear(false), 3000);
                    }
                  }}
                  className="text-xs text-gray-700"
                >
                  <Trash2 size={12} />
                  {confirmClear ? "한 번 더 클릭해서 전체 삭제" : "전체 삭제"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            onClick={onToggle}
            className="text-muted-foreground/70 hover:bg-muted flex h-7 w-7 items-center justify-center rounded-lg"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto py-2">
        {!isLoaded ? (
          <div className="text-muted-foreground/70 px-4 py-8 text-center text-xs">
            불러오는 중...
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground/70 px-4 py-8 text-center text-xs">
            저장된 분석 결과가 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                "group hover:bg-muted/50 flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors",
                currentId === item.id && "bg-muted"
              )}
            >
              {/* 파비콘 */}
              <div className="bg-muted mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                {item.companyUrl ? (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${new URL(item.companyUrl).hostname}&sz=32`}
                    alt=""
                    className="h-4 w-4 rounded"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <FileText size={13} className="text-muted-foreground/70" />
                )}
              </div>

              {/* 정보 */}
              <div className="min-w-0 flex-1">
                <p className="text-primary/90 truncate text-xs font-medium">{item.companyName}</p>
                <p className="text-muted-foreground truncate text-xs">{item.jobTitle}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  {item.providers.map((p) => (
                    <span
                      key={p}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-medium",
                        PROVIDER_COLORS[p]
                      )}
                    >
                      {PROVIDER_SHORT[p]}
                    </span>
                  ))}
                </div>
                <div className="text-muted-foreground/70 mt-1 flex items-center gap-1 text-[10px]">
                  <Clock size={9} />
                  {formatDate(item.createdAt)}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(item.id);
                  toast.success("분석 히스토리가 삭제되었습니다.");
                }}
                className="text-muted-foreground/50 mt-0.5 hidden group-hover:block hover:text-gray-700"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
