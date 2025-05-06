/**
 * 타로 카드 히스토리 API 서비스
 */

// 타로 카드 정보 타입 정의
export interface TarotCards {
  cards: number[];
  reversed: boolean[];
}

// 히스토리 아이템 타입 정의
export interface HistoryItem {
  question: string;
  cards: TarotCards; // 카드 배열에서 객체로 변경
  result: string;
  created_at: string;
}

// 히스토리 응답 타입 정의 (페이지네이션 지원)
export interface HistoryResponse {
  history: HistoryItem[];
  next_cursor_doc_id: string | null;
}

/**
 * 타로 카드 히스토리 서비스 클래스
 */
export class HistoryService {
  private readonly API_URL: string;
  private readonly DEFAULT_TIMEOUT: number;

  /**
   * HistoryService 생성자
   * @param apiUrl API 기본 URL (기본값: 환경변수에서 로드)
   * @param timeout API 요청 타임아웃 시간(ms) (기본값: 10000ms)
   */
  constructor(apiUrl?: string, timeout: number = 10000) {
    this.API_URL = apiUrl || import.meta.env.VITE_API_URL;
    this.DEFAULT_TIMEOUT = timeout;
  }

  /**
   * 타로 카드 히스토리 조회 (커서 기반 페이지네이션 지원)
   * @param userId OAuth 식별자
   * @param provider OAuth 제공자
   * @param cursorDocId 다음 페이지를 위한 커서 (옵션)
   * @returns 타로 카드 히스토리 응답 (페이지네이션 정보 포함)
   */
  async getTarotHistory(
    userId: string, 
    provider: string, 
    cursorDocId?: string
  ): Promise<HistoryResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);
      
      // URL 구성 - 커서가 있으면 포함
      let url = `${this.API_URL}/tarot/history?user_id=${encodeURIComponent(userId)}&provider=${encodeURIComponent(provider)}`;
      
      // 만약 커서가 있으면 URL에 추가
      if (cursorDocId) {
        url += `&cursor_doc_id=${encodeURIComponent(cursorDocId)}`;
      }
      
      // API 호출
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // 응답 오류 확인
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `서버 오류: ${response.status}`);
      }
      
      // 성공적인 응답 반환
      const data = await response.json();
      
      // 이전 API 호환성을 위한 처리 (배열 형태로 반환된 경우)
      if (Array.isArray(data)) {
        console.warn('서버가 이전 형식의 응답을 반환했습니다. 페이지네이션이 지원되지 않습니다.');
        return {
          history: data,
          next_cursor_doc_id: null
        };
      }
      
      return data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * 타로 히스토리 API 오류 처리
   * @param error 발생한 오류
   */
  private handleApiError(error: unknown): never {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('서버 응답 시간이 너무 깁니다. 다시 시도해주세요.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
      }
      throw error;
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }

  /**
   * 날짜 포맷팅 유틸리티
   * @param dateString 날짜 문자열 (ISO 형식)
   * @returns 포맷된 날짜 문자열
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
        return dateString; // 포맷팅 실패 시 원본 문자열 반환
    }
  }

  /**
   * 히스토리 아이템 정렬
   * @param items 히스토리 아이템 배열
   * @param order 정렬 순서 ('asc': 오래된순, 'desc': 최신순)
   * @returns 정렬된 히스토리 아이템 배열
   */
  static sortHistoryItems(items: HistoryItem[], order: 'asc' | 'desc' = 'desc'): HistoryItem[] {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }
}

// 서비스 싱글톤 인스턴스 생성
const historyService = new HistoryService();
export default historyService;
