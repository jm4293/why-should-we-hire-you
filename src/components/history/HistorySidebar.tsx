"use client";

import { useEffect, useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Clock,
  MoreHorizontal,
  FileText,
} from "lucide-react";
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
  openai: "bg-gray-100 text-gray-600",
  anthropic: "bg-gray-100 text-gray-600",
  google: "bg-gray-100 text-gray-600",
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
      <aside className="flex h-full w-14 flex-col items-center gap-3 border-r border-gray-200 bg-white py-4">
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
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
                currentId === item.id ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
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
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="text-sm font-medium text-gray-700">분석 히스토리</span>
        <div className="flex items-center gap-1">
          {items.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400">
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
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto py-2">
        {!isLoaded ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            저장된 분석 결과가 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                "group flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                currentId === item.id && "bg-gray-100"
              )}
            >
              {/* 파비콘 */}
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
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
                  <FileText size={13} className="text-gray-400" />
                )}
              </div>

              {/* 정보 */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-800">{item.companyName}</p>
                <p className="truncate text-xs text-gray-500">{item.jobTitle}</p>
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
                <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock size={9} />
                  {formatDate(item.createdAt)}
                </div>
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(item.id);
                }}
                className="mt-0.5 hidden text-gray-300 group-hover:block hover:text-gray-700"
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
