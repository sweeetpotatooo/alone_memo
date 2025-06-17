# 나홀로 메모장 (Alone Memo Next.js)

## 소개
- Next.js 14 기반의 개인 메모/댓글/알림 웹앱
- Prisma, SQL, MUI, JWT 인증, CI/CD, E2E(Jest, Cypress) 지원

## 주요 기능
- 회원가입/로그인/로그아웃 (JWT 기반)
- 메모 CRUD, 댓글, 좋아요, 알림
- 본인 댓글만 수정/삭제 가능
- 반응형 UI (MUI)
- 검색, 정렬, 카드/리스트 뷰
- CI/CD: lint, type-check, test, build (GitHub Actions)
- 단위(Jest) 및 E2E(Cypress) 테스트

## 개발/실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. DB 마이그레이션 (최초 1회)
```bash
npx prisma migrate deploy
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 테스트
- 단위 테스트(Jest):
  ```bash
  npm test
  ```
- E2E 테스트(Cypress):
  ```bash
  npm run dev # 새 터미널에서
  npx cypress open
  ```

### 5. 린트/타입체크/빌드
```bash
npm run lint
npm run build
```

## 폴더 구조
- `src/app/` : Next.js App Router, 페이지/컴포넌트/API
- `src/generated/prisma/` : Prisma Client (자동 생성, 린트/타입체크 제외)
- `__tests__/` : Jest 테스트
- `cypress/` : Cypress E2E 테스트

## 환경 변수
- JWT 시크릿 등은 `.env` 파일에 설정 (예시: `JWT_SECRET=your_secret`)

## 기타
- ESLint: flat config(`eslint.config.mjs`)
- TypeScript: strict mode, generated 폴더 제외
- CI: `.github/workflows/ci.yml` 참고

---
문의/이슈는 PR 또는 Issue로 남겨주세요.
