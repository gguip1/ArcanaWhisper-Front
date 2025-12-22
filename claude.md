# ArcanaWhisper 프로젝트 가이드라인

## 프로젝트 개요

ArcanaWhisper는 AI 기반 타로 리딩 서비스입니다. 사용자가 질문을 입력하고 타로 카드를 선택하면 AI가 해석 결과를 제공합니다.

### 핵심 가치
- **프리미엄**: 고급스럽고 세련된 사용자 경험
- **차분함**: 과하지 않은 절제된 시각적 표현
- **일관성**: 단일 디자인 시스템, 단일 아이콘 세트
- **모바일 우선**: 모든 UI 결정에서 모바일 환경 최우선 고려

---

## 개발 필수 도구

개발 진행 시 반드시 다음 도구를 사용합니다:

### 1. Sequential Thinking MCP
복잡한 문제 해결, 기능 구현 계획, 분석 작업 시 사용합니다.
```
사용 시점:
- 새 기능 구현 전 설계
- 버그 원인 분석
- 아키텍처 결정
- 리팩토링 계획
```

### 2. Context7 MCP
라이브러리 문서 조회 시 사용합니다.
```
사용 시점:
- React, Vite, Firebase 등 라이브러리 API 확인
- 최신 문법/패턴 확인
- 라이브러리 버전별 차이 확인

사용 방법:
1. resolve-library-id로 라이브러리 ID 조회
2. get-library-docs로 문서 조회
```

---

## 비협상 규칙 (Non-negotiables)

### UI/UX 규칙
1. **이모지 금지**: UI 문자열, 문서, 코멘트, 예시 코드에 이모지 사용 금지
2. **단일 아이콘 세트**: react-icons의 FontAwesome (fa/fa6)만 사용
3. **토큰 우선**: 색상, 간격, 타이포그래피는 반드시 docs/brand/tokens.md에 정의 후 사용
4. **문서 업데이트 필수**: 기능 변경 시 관련 문서 동시 업데이트
5. **한국어만 지원**: i18n 제거됨, 모든 문자열은 한국어로 직접 작성

### 코딩 규칙
1. **최소 변경 원칙**: 요청받은 변경만 수행, 불필요한 리팩토링 금지
2. **기존 패턴 준수**: 새로운 패턴 도입 전 기존 코드 확인 필수
3. **과도한 엔지니어링 금지**: 현재 필요한 것만 구현

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 19 + Vite 6 + TypeScript 5.7 |
| 스타일링 | Plain CSS (컴포넌트별 분리) |
| 라우팅 | react-router-dom v7 |
| 상태관리 | React Context |
| 아이콘 | react-icons (FontAwesome) |
| 인증 | Firebase Auth (Google OAuth) |
| 데이터베이스 | Firestore (예정) |
| API | AWS Lambda |

### 제거된 기술
| 기술 | 상태 | 이유 |
|------|------|------|
| Kakao OAuth | 제거 예정 | Firebase 통합 불가, 보안 문제 |
| PWA (Workbox) | 제거 예정 | 복잡도 대비 낮은 활용도 |
| i18n (i18next) | 제거 예정 | 한국어만 지원 |

---

## 디자인 시스템

### Celestial 컬러 팔레트
딥 인디고와 코퍼(로즈골드)의 조합으로 우주적이고 세련된 분위기를 연출합니다.

| 역할 | 색상 | HEX |
|------|------|-----|
| 배경 | Cosmos | #0C0C1E |
| 표면 | Deep Space | #1A1A2E |
| 액센트 | Indigo | #6366F1 |
| 따뜻한 액센트 | Copper | #B76E79 |
| 텍스트 | Starlight | #F1F5F9 |

### 문서 참조
모든 디자인 관련 결정은 아래 문서를 참조:

- `docs/brand/design-system.md` - 브랜드 원칙, 레이아웃 규칙
- `docs/brand/tokens.md` - Celestial 색상, 간격, 그림자 토큰
- `docs/brand/typography.md` - 타이포그래피 스케일
- `docs/brand/iconography.md` - 아이콘 사용 규칙
- `docs/brand/copy-tone.md` - 카피 톤앤매너

---

## 폴더 구조

```
arcana-whiper-front/
├── src/
│   ├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── pages/          # 페이지 컴포넌트 (라우트별)
│   ├── contexts/       # React Context 정의
│   ├── hooks/          # 커스텀 훅
│   ├── services/       # API 호출, 외부 서비스 연동
│   ├── styles/         # CSS 파일 (컴포넌트별)
│   ├── data/           # 정적 데이터 (타로 카드 정보 등)
│   ├── types/          # TypeScript 타입 정의
│   ├── utils/          # 유틸리티 함수
│   └── constants/      # 상수 정의
├── public/             # 정적 파일
│   ├── privacy-policy.html   # 개인정보 처리방침 (순수 HTML)
│   └── terms-of-service.html # 이용약관 (순수 HTML)
└── docs/               # 프로젝트 문서
    ├── brand/          # 디자인 시스템 문서
    ├── product/        # 제품 요구사항 문서
    └── engineering/    # 기술 문서
```

---

## 법적 문서

개인정보 처리방침과 이용약관은 React 컴포넌트가 아닌 **순수 HTML 파일**로 제공됩니다.

| 파일 | 경로 | 접근 URL |
|------|------|----------|
| 개인정보 처리방침 | `public/privacy-policy.html` | `/privacy-policy.html` |
| 이용약관 | `public/terms-of-service.html` | `/terms-of-service.html` |

**이유:**
- SEO 및 크롤링 용이
- 법적 문서는 별도 관리
- 앱 번들에 포함되지 않음

**수정 필요 사항:**
- privacy-policy.html의 이메일 주소 입력 필요
- Home.tsx 또는 Footer에 링크 추가 필요

---

## 작업 워크플로우

### 기능 구현 순서
1. **Sequential Thinking으로 분석**: 구현 전 설계 및 계획
2. **Context7로 문서 확인**: 필요한 라이브러리 API 확인
3. **사용자 플로우 확인**: docs/product/user-flows.md에서 관련 플로우 확인
4. **증거 수집**: 기존 코드에서 유사한 패턴 찾기
5. **최소 변경 계획**: 변경 범위를 최소화하여 계획
6. **구현**: 계획대로 구현
7. **문서 업데이트**: 변경사항 문서에 반영

### PR/커밋 체크리스트
- [ ] UI 변경 시 스크린샷 첨부
- [ ] 관련 문서 업데이트 여부 확인
- [ ] 새로운 색상/간격 사용 시 tokens.md에 정의 확인
- [ ] 아이콘 사용 시 FontAwesome (fa) 사용 확인
- [ ] 이모지 사용 여부 확인 (금지)
- [ ] 모바일 반응형 테스트 완료
- [ ] 한국어 문자열 직접 작성 (t() 함수 사용 금지)

---

## 주요 라우트

| 경로 | 설명 | 컴포넌트 |
|------|------|----------|
| `/` | 홈 | HomePage |
| `/question` | 질문 입력 | QuestionPage |
| `/cards` | 카드 선택 | CardSelectionPage |
| `/result` | 결과 표시 | ResultPage |
| `/history` | 히스토리 | HistoryPage |
| `/privacy-policy.html` | 개인정보 처리방침 | (순수 HTML) |
| `/terms-of-service.html` | 이용약관 | (순수 HTML) |

---

## 아이콘 사용 규칙

### 허용
```tsx
import { FaHome, FaArrowRight } from 'react-icons/fa';
```

### 금지
```tsx
// 다른 아이콘 세트 사용 금지
import { MdHome } from 'react-icons/md';  // X
import { IoHome } from 'react-icons/io';  // X

// 이모지 사용 금지
<span>Start Reading</span>  // X
```

---

## 모바일 우선 원칙

1. **터치 타겟**: 최소 44x44px
2. **기본 레이아웃**: 단일 컬럼, 점진적 확장
3. **폰트 크기**: 모바일에서 읽기 쉬운 크기 유지
4. **간격**: 충분한 여백으로 터치 오류 방지
5. **성능**: 무거운 효과 지양, 가벼운 비주얼 유지

---

## 에러 처리 패턴

```typescript
// 에러 응답 형식
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 사용자 친화적 에러 메시지 (한국어 직접 작성)
const errorMessage = "네트워크 연결을 확인해주세요.";
```

---

## 변경 시 주의사항

1. **CSS 변수 수정**: index.css의 :root 섹션만 수정
2. **색상 추가**: 반드시 tokens.md에 먼저 정의
3. **새 컴포넌트**: components/ 폴더에 생성, 해당 CSS는 styles/ 폴더에
4. **상수 추가**: constants/index.ts에 정의
5. **타입 추가**: types/index.ts에 정의
6. **법적 문서 수정**: public/ 폴더의 HTML 파일 직접 수정

---

## 현재 프로젝트 상태

자세한 문제점 및 해결 방안은 아래 문서 참조:
- **`docs/engineering/project-issues.md`** - 29개 문제점 분석 및 권장 조치 순서

### 즉시 해결 필요 (출시 전)
1. API 인증 토큰 추가 (보안)
2. Kakao OAuth 제거 (Google만 사용)
3. PWA 제거
4. i18n 제거
5. 미사용 라이브러리 제거
6. ErrorBoundary 추가

---

## 참고 문서

- 프로젝트 문제점: `docs/engineering/project-issues.md`
- 최소 리팩토링: `docs/engineering/minimal-refactors.md`
- 엔지니어링 아키텍처: `docs/engineering/architecture.md`
- 코딩 표준: `docs/engineering/coding-standards.md`
- API 계약: `docs/engineering/api-contract.md`
- 릴리스 가이드: `docs/engineering/release-runbook.md`
