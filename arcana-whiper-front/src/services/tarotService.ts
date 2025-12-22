/**
 * 타로 카드 해석 API 서비스
 */

import { auth } from './authService';

// 타로 카드 정보에 대한 타입 정의
interface TarotCards {
  cards: number[];
  reversed: boolean[];
}

// API 요청에 대한 타입 정의
interface TarotRequest {
  cards: TarotCards; // 카드와 방향 정보를 포함하는 객체로 변경
  question: string;
  user_id?: string;
  provider?: string;
}

// API 응답에 대한 타입 정의
interface TarotResponse {
  message: string;
  cards: TarotCards; // 카드와 방향 정보를 포함하는 객체로 변경
  result: string;
}

/**
 * 타로 카드 해석 API 요청
 * @param requestData - 요청 데이터 (카드, 질문, 사용자ID, 제공자)
 * @returns API 응답 객체
 */
export async function requestTarotReading(requestData: TarotRequest): Promise<TarotResponse> {
  // 요청 전 유효성 검사
  if (!requestData.cards || !requestData.cards.cards || requestData.cards.cards.length !== 3) {
    throw new Error('정확히 3장의 카드가 필요합니다');
  }
  
  if (!requestData.cards.reversed || requestData.cards.reversed.length !== 3) {
    throw new Error('각 카드의 방향 정보가 필요합니다');
  }
  
  if (!requestData.question || requestData.question.trim() === '') {
    throw new Error('타로 질문이 필요합니다');
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const API_URL = import.meta.env.VITE_API_URL;

    // Firebase ID Token 획득 (로그인된 경우에만)
    const idToken = await auth.currentUser?.getIdToken();

    // API 호출
    const response = await fetch(`${API_URL}/tarot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify(requestData),
      signal: controller.signal
    });
    
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
  } finally {
    clearTimeout(timeoutId);
  }
}

// 타로 카드 방향 생성 유틸리티 함수
export function generateCardDirections(count: number): boolean[] {
  const directions: boolean[] = [];
  for (let i = 0; i < count; i++) {
    // 각 카드마다 50% 확률로 정방향(false) 또는 역방향(true) 설정
    directions.push(Math.random() < 0.5);
  }
  return directions;
}
