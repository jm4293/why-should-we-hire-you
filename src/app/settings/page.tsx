"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { APIKeyForm } from "@/components/settings/APIKeyForm";
import { getAllAPIKeys } from "@/lib/storage/api-keys";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const [keyCount, setKeyCount] = useState<number | null>(null);

  const refreshCount = () => {
    setKeyCount(getAllAPIKeys().length);
  };

  useEffect(() => {
    refreshCount();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 네비 */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={16} />
            돌아가기
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-sm font-medium text-gray-900">설정</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* 타이틀 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">API 키 설정</h2>
          <p className="mt-2 text-sm text-gray-500">
            사용할 AI 서비스의 API 키를 등록합니다. 등록된 키 수만큼 면접관이 생성됩니다.
          </p>
          {keyCount !== null && keyCount > 0 && (
            <p className="mt-1 text-sm font-medium text-gray-700">
              현재 {keyCount}개의 API 키가 등록되어 있습니다. (면접관 {keyCount}명)
            </p>
          )}
        </div>

        {/* 키 미등록 배너 */}
        {keyCount !== null && keyCount === 0 && (
          <div className="mb-6 rounded-2xl border border-gray-900 bg-gray-900 p-5">
            <p className="text-sm font-medium text-white">아직 등록된 API 키가 없습니다.</p>
            <p className="mt-1 text-xs text-gray-400">
              아래에서 하나 이상의 키를 등록해야 분석을 시작할 수 있습니다.
            </p>
          </div>
        )}

        {/* 보안 안내 */}
        <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-gray-500" />
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-gray-800">보안 안내</p>
              <ul className="space-y-1 text-gray-500">
                <li>API 키는 이 기기의 브라우저에만 저장됩니다. 서버로 전송되지 않습니다.</li>
                <li>공용 PC 또는 타인의 기기에서는 사용하지 마세요.</li>
                <li>키는 암호화하여 저장되지만, 개인 기기에서만 사용하는 것을 권장합니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 비용 안내 */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex gap-3">
            <Info size={18} className="mt-0.5 shrink-0 text-gray-500" />
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-gray-800">비용 안내</p>
              <ul className="space-y-1 text-gray-500">
                <li>분석 시 등록한 API 키 기준으로 소액의 비용이 발생합니다.</li>
                <li>면접관 1명 기준 약 $0.01~$0.10 수준입니다. (선택 모델에 따라 다름)</li>
                <li>비용은 각 AI 서비스의 대시보드에서 확인할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API 키 폼 */}
        <APIKeyForm onSaved={refreshCount} />

        {/* 하단 안내 */}
        <p className="mt-8 text-center text-xs text-gray-400">
          등록된 키는 브라우저를 닫아도 유지됩니다. 삭제하려면 각 항목의 삭제 버튼을 사용하세요.
        </p>
      </div>
    </div>
  );
}
