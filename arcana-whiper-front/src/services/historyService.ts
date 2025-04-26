/**
 * 타로 카드 히스토리 API 서비스
 */

// 히스토리 아이템 타입 정의
export interface HistoryItem {
  question: string;
  cards: number[];
  result: string;
  created_at: string;
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
   * 타로 카드 히스토리 조회
   * @param userId OAuth 식별자
   * @param provider OAuth 제공자
   * @returns 타로 카드 히스토리 목록
   */
  async getTarotHistory(userId: string, provider: string): Promise<HistoryItem[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);
      
      // API 호출
      const response = await fetch(
        `${this.API_URL}/tarot/history?user_id=${encodeURIComponent(userId)}&provider=${encodeURIComponent(provider)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      // 응답 오류 확인
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `서버 오류: ${response.status}`);
      }
      
      // 성공적인 응답 반환
      return await response.json();
    } catch (error) {
      this.handleApiError(error);
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
