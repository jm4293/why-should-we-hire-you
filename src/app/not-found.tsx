import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-6xl font-semibold text-muted-foreground/30">404</p>
      <h1 className="text-xl font-semibold text-primary">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-muted-foreground">요청하신 페이지가 존재하지 않거나 이동됐습니다.</p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-gray-700"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
