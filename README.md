# Why Should We Hire You?

### 왜 당신을 채용해야 하나요?

AI 면접관이 이력서와 포트폴리오를 분석해 서류 합격 가능성을 높여주는 서비스입니다.

---

## 서비스 소개

10년 경력의 면접관 관점에서 AI가 지원자의 서류를 분석합니다.

- 채용 공고 기반으로 적합성 판단
- 이력서 / 포트폴리오 수정 제안
- 자소서 초안 작성
- 여러 AI 면접관의 다양한 시각 제공

---

## 시작하기 전에

이 서비스는 사용자가 직접 AI API 키를 등록해 사용합니다.

### 지원 AI

- [OpenAI (ChatGPT)](https://platform.openai.com/api-keys)
- [Anthropic (Claude)](https://console.anthropic.com/)
- [Google (Gemini)](https://aistudio.google.com/app/apikey)

### 주의사항

- API 키는 **본인의 기기 브라우저에만 저장**됩니다. 서버에 전송되지 않습니다.
- **개인 PC에서만 사용**하세요. 공용 PC 사용 시 API 키가 노출될 수 있습니다.
- 분석 시 등록된 API 키로 **비용이 발생**합니다. (1회 분석 기준 약 $0.01~$0.10, 모델에 따라 상이)

---

## 로컬 개발

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

---

## 기술 스택

| 분류       | 기술                                 |
| ---------- | ------------------------------------ |
| 프레임워크 | Next.js 14+ (App Router)             |
| 스타일링   | Tailwind CSS + shadcn/ui             |
| 아이콘     | Lucide React                         |
| 애니메이션 | GSAP + ScrollTrigger                 |
| AI 통합    | Vercel AI SDK                        |
| PDF 파싱   | pdfjs-dist                           |
| PDF 생성   | html2pdf.js                          |
| 로컬 저장  | IndexedDB (idb)                      |
| 상태 관리  | Zustand (Analysis, UI Modal 상태 등) |
| 배포       | Vercel                               |

---

## 코딩 컨벤션 (규칙)

1. **단일 컴포넌트 원칙**: 모든 컴포넌트는 개별 파일로 분리하여 관리합니다 (1 File = 1 Component).
2. **글로벌 모달 관리**: 인라인 모달 작성을 지양하고 기능별로 독립된 파일로 생성 후 Zustand 전역 상태로 관리합니다.

---

## 라이선스

MIT
