"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parsePDFText } from "@/lib/pdf/parse";
import type { ResumeFile } from "@/types";

interface Step2ResumeProps {
  value: ResumeFile[];
  onChange: (value: ResumeFile[]) => void;
}

export function Step2Resume({ value, onChange }: Step2ResumeProps) {
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);
  const [resumeParsing, setResumeParsing] = useState(false);
  const [portfolioParsing, setPortfolioParsing] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [resumeDragActive, setResumeDragActive] = useState(false);
  const [portfolioDragActive, setPortfolioDragActive] = useState(false);

  const resume = value.find((f) => f.type === "resume");
  const extras = value.filter((f) => f.type === "portfolio");

  const handleFile = async (file: File, type: ResumeFile["type"]) => {
    const isResume = type === "resume";
    const setParsing = isResume ? setResumeParsing : setPortfolioParsing;
    const setError = isResume ? setResumeError : setPortfolioError;

    if (file.type !== "application/pdf") {
      setError(`${file.name}: PDF 파일만 업로드할 수 있습니다.`);
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const [text, dataUrl] = await Promise.all([
        parsePDFText(file),
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
      ]);

      if (!text.trim()) {
        setError(`${file.name}: 텍스트를 추출할 수 없습니다. 스캔된 PDF는 지원하지 않습니다.`);
        return;
      }

      const newFile: ResumeFile = { name: file.name, text, type, dataUrl };

      if (type === "resume") {
        onChange([newFile, ...value.filter((f) => f.type === "portfolio")]);
      } else {
        onChange([...value.filter((f) => f.type === "resume"), ...extras, newFile]);
      }
    } catch {
      setError(`${file.name}: 파일 처리 중 오류가 발생했습니다.`);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: ResumeFile["type"]) => {
    e.preventDefault();
    const setDragActive = type === "resume" ? setResumeDragActive : setPortfolioDragActive;
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, type);
  };

  const removeFile = (name: string) => {
    onChange(value.filter((f) => f.name !== name));
  };

  const DropZone = ({
    type,
    label,
    required,
    inputRef,
    hasFile,
    isParsing,
    error,
    isDragActive,
    onDragActive,
    multiple = false,
  }: {
    type: ResumeFile["type"];
    label: string;
    required?: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
    hasFile: boolean;
    isParsing: boolean;
    error: string | null;
    isDragActive: boolean;
    onDragActive: (active: boolean) => void;
    multiple?: boolean;
  }) => (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {required && <span className="text-xs font-medium text-red-500">필수</span>}
        {!required && <span className="text-xs text-muted-foreground/70">선택</span>}
      </div>

      <div
        onDrop={(e) => handleDrop(e, type)}
        onDragOver={(e) => {
          e.preventDefault();
          onDragActive(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          onDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          onDragActive(false);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2",
          "rounded-xl border-2 border-dashed p-6 transition-colors",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : error
              ? "border-red-300 bg-red-50"
              : hasFile
                ? "border-border bg-muted/50"
                : "border-border bg-background hover:border-gray-400 hover:bg-muted/50"
        )}
      >
        {isParsing ? (
          <Loader2 size={20} className="animate-spin text-muted-foreground/70" />
        ) : (
          <Upload size={20} className={cn(isDragActive ? "text-blue-500" : "text-muted-foreground/70")} />
        )}
        <p className={cn("text-xs", isDragActive ? "font-medium text-blue-600" : "text-muted-foreground")}>
          {isParsing
            ? "파싱 중..."
            : isDragActive
              ? "여기에 놓으세요"
              : "PDF 파일을 드래그하거나 클릭해서 선택하세요"}
        </p>
      </div>

      {error && (
        <div className="mt-2 flex items-start gap-2 text-xs text-red-600">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          files.forEach((f) => handleFile(f, type));
          e.target.value = "";
        }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-primary">내 서류</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          이력서는 필수이며, 포트폴리오나 경력기술서는 선택입니다. PDF 파일만 지원합니다.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-background p-6">
        {/* 이력서 */}
        <DropZone
          type="resume"
          label="이력서"
          required
          inputRef={resumeInputRef}
          hasFile={!!resume}
          isParsing={resumeParsing}
          error={resumeError}
          isDragActive={resumeDragActive}
          onDragActive={setResumeDragActive}
        />

        {/* 업로드된 이력서 */}
        {resume && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
            <FileText size={16} className="shrink-0 text-muted-foreground" />
            <p className="flex-1 truncate text-sm text-gray-700">{resume.name}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFile(resume.name)}
              className="h-7 w-7 p-0 text-muted-foreground/70 hover:text-primary"
            >
              <X size={14} />
            </Button>
          </div>
        )}

        <div className="border-t border-border/50" />

        {/* 추가 서류 */}
        <DropZone
          type="portfolio"
          label="포트폴리오 / 경력기술서"
          inputRef={extraInputRef}
          hasFile={extras.length > 0}
          isParsing={portfolioParsing}
          error={portfolioError}
          isDragActive={portfolioDragActive}
          onDragActive={setPortfolioDragActive}
          multiple
        />

        {/* 업로드된 추가 서류 목록 */}
        {extras.length > 0 && (
          <div className="space-y-2">
            {extras.map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                <FileText size={16} className="shrink-0 text-muted-foreground" />
                <p className="flex-1 truncate text-sm text-gray-700">{f.name}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(f.name)}
                  className="h-7 w-7 p-0 text-muted-foreground/70 hover:text-primary"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground/70">
        스캔된 이미지 형태의 PDF는 텍스트 추출이 불가능합니다. 텍스트 선택이 가능한 PDF를
        사용해주세요.
      </p>
    </div>
  );
}
