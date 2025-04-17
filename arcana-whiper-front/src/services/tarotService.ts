/**
 * 타로 카드 해석 API 서비스
 */

// API 요청에 대한 타입 정의
interface TarotRequest {
  cards: number[];
}

// API 응답에 대한 타입 정의
interface TarotResponse {
  message: string;
  cards: number[];
  result: string;
}

/**
 * 타로 카드 해석 API 요청
 * @param cardNumbers - 선택한 카드 번호 배열 (3개)
 * @returns API 응답 객체
 */
export async function requestTarotReading(cardNumbers: number[]): Promise<TarotResponse> {
  // 요청 전 유효성 검사
  if (!cardNumbers || cardNumbers.length !== 3) {
    throw new Error('정확히 3장의 카드가 필요합니다');
  }
  
  try {
    // 5초 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    // API 호출
    const response = await fetch('http://localhost:8000/tarot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cards: cardNumbers }),
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
