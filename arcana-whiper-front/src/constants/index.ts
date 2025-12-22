// 애플리케이션 상수 정의

// 타로 카드 관련 상수
export const MAX_CARDS = 3;

// 페이지 전환 상수
export const TRANSITION_DURATION = 2000; // 2초

// 로컬 스토리지 키 상수
export const STORAGE_KEYS = {
  USER: 'arcana_whisper_user',
} as const;

// API 관련 상수
export const API_TIMEOUT = 30000; // 30초
export const RETRY_ATTEMPTS = 3;

// 페이지 경로 상수
export const ROUTES = {
  HOME: '/',
  QUESTION: '/question',
  CARDS: '/cards',
  RESULT: '/result',
  HISTORY: '/history',
} as const;

// 애니메이션 상수
export const ANIMATION_DELAYS = {
  SHORT: 100,
  MEDIUM: 300,
  LONG: 500,
} as const;

// 브레이크포인트 상수
export const BREAKPOINTS = {
  MOBILE: 576,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1200,
} as const;

// 에러 메시지 상수
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  TIMEOUT_ERROR: '서버 응답 시간이 너무 깁니다. 다시 시도해주세요.',
  CARDS_REQUIRED: '정확히 3장의 카드가 필요합니다.',
  QUESTION_REQUIRED: '타로 질문이 필요합니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
} as const;
