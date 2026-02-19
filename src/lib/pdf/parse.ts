"use client";

export async function parsePDFText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");

  // Worker 설정 — public 폴더의 로컬 파일 사용
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n");
}
