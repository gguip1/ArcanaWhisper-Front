// 공통 타입 정의

// 페이지 타입
export type PageType = 'home' | 'question' | 'cardSelection' | 'result' | 'history';

// 선택된 카드 정보 인터페이스
export interface SelectedCardInfo {
  number: number;    // 카드 번호 (고유 식별자)
  reversed: boolean; // 역방향 여부
}

// 타로 카드 인터페이스
export interface TarotCard {
  number: number;
  name: string;
  reversed?: boolean;
}

// 타로 상태 인터페이스
export interface TarotState {
  selectedCards: SelectedCardInfo[];
  question: string;
  readingResult: string;
  historyId: string;
  isLoading: boolean;
  currentPage: PageType;
}

// 타로 액션 타입
export type TarotAction =
  | { type: 'SET_SELECTED_CARDS'; payload: SelectedCardInfo[] }
  | { type: 'SET_QUESTION'; payload: string }
  | { type: 'SET_READING_RESULT'; payload: string }
  | { type: 'SET_HISTORY_ID'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_PAGE'; payload: PageType }
  | { type: 'RESET_STATE' };

// 인증 관련 타입 (Google만 지원)
export type AuthProvider = 'google';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: string;
}

// API 응답 타입
export interface TarotResponse {
  message: string;
  cards: {
    cards: number[];
    reversed: boolean[];
  };
  result: string;
  history_id: string;
}

// 공유 관련 타입
export interface CreateShareResponse {
  share_id: string;
}

export interface SharedReading {
  question: string;
  cards: {
    cards: number[];
    reversed: boolean[];
  };
  result: string;
  created_at: string;
}

// 히스토리 관련 타입
export interface HistoryItem {
  history_id: string;
  question: string;
  cards: {
    cards: number[];
    reversed: boolean[];
  };
  result: string;
  created_at: string;
  is_shared: boolean;
}

export interface HistoryResponse {
  history: HistoryItem[];
  next_cursor_doc_id: string | null;
}
