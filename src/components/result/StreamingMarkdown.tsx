"use client";

import React from "react";

export function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-primary/90 font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function StreamingMarkdown({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1;

        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-primary mt-6 mb-2 text-base font-semibold first:mt-0">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-primary/90 mt-4 mb-1.5 text-sm font-semibold">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="ml-4 list-disc text-gray-700">
              {renderInline(line.slice(2))}
            </li>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }

        return (
          <p key={i} className="text-gray-700">
            {renderInline(line)}
            {isLast && isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-400" />
            )}
          </p>
        );
      })}
    </div>
  );
}
