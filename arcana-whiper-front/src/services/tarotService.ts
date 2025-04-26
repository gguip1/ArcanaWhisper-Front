/**
 * 타로 카드 해석 API 서비스
 */

// API 요청에 대한 타입 정의
interface TarotRequest {
  cards: number[];
  question: string; // 질문 추가
  user_id?: string; // 선택적 사용자 ID
  provider?: string; // 선택적 제공자 정보
}

// API 응답에 대한 타입 정의
interface TarotResponse {
  message: string;
  cards: number[];
  result: string;
}

/**
 * 타로 카드 해석 API 요청
 * @param requestData - 요청 데이터 (카드, 질문, 사용자ID, 제공자)
 * @returns API 응답 객체
 */
export async function requestTarotReading(requestData: TarotRequest): Promise<TarotResponse> {
  // 요청 전 유효성 검사
  if (!requestData.cards || requestData.cards.length !== 3) {
    throw new Error('정확히 3장의 카드가 필요합니다');
  }
  
  if (!requestData.question || requestData.question.trim() === '') {
    throw new Error('타로 질문이 필요합니다');
  }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    // API 호출
    const response = await fetch(`${API_URL}/tarot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // 응답 오류 확인
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `서버 오류: ${response.status}`);
    }
    
    // 성공적인 응답 반환
    return await response.json();
  } catch (error) {
    // 다양한 에러 유형 처리
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
}
