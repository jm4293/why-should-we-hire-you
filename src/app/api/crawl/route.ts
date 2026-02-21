import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // 간단한 내부 서비스 검증
  const internalKey = req.headers.get("x-internal-service-key");
  const expectedKey =
    process.env.INTERNAL_SERVICE_KEY || "why-should-we-hire-you-internal-key-2026";

  if (internalKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const { url } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "유효한 URL을 입력해주세요." }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `페이지를 불러올 수 없습니다. (${res.status})` },
        { status: 400 }
      );
    }

    const html = await res.text();

    // Edge Runtime에서는 cheerio 사용 불가, 정규식으로 텍스트 추출
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 8000);

    // 파비콘 추출
    const faviconMatch =
      html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);

    let favicon: string | null = null;
    if (faviconMatch) {
      const raw = faviconMatch[1];
      if (raw.startsWith("http")) {
        favicon = raw;
      } else {
        const base = new URL(url);
        favicon = `${base.protocol}//${base.host}${raw.startsWith("/") ? "" : "/"}${raw}`;
      }
    } else {
      const base = new URL(url);
      favicon = `${base.protocol}//${base.host}/favicon.ico`;
    }

    return NextResponse.json({ text, favicon });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: `크롤링에 실패했습니다: ${message}` }, { status: 500 });
  }
}
