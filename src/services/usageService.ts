/**
 * 사용량 조회 API 서비스
 */

import { auth } from './authService';

// 사용량 정보 인터페이스
export interface UsageInfo {
  used: number;
  limit: number;
  isLoggedIn: boolean;
  remaining: number;
}

// 로컬 스토리지 키 정의
const GUEST_TOKEN_KEY = 'arcana_whisper_guest_token';

/**
 * Guest Token 생성 (UUID v4 형식)
 */
function generateGuestToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Guest Token 가져오기 (없으면 생성)
 */
function getGuestToken(): string {
  let guestToken = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!guestToken) {
    guestToken = generateGuestToken();
    localStorage.setItem(GUEST_TOKEN_KEY, guestToken);
  }
  return guestToken;
}

/**
 * 사용량 정보 조회
 * - 로그인 사용자: Firebase ID Token으로 조회
 * - 비로그인 사용자: Device ID로 조회
 */
export async function getUsageInfo(): Promise<UsageInfo> {
  const API_URL = import.meta.env.VITE_API_URL;

  try {
    // Firebase ID Token 획득 (로그인된 경우에만)
    const idToken = await auth.currentUser?.getIdToken();

    let response: Response;

    if (idToken) {
      // 로그인 사용자
      response = await fetch(`${API_URL}/usage`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } else {
      // 비로그인 사용자
      const guestToken = getGuestToken();
      response = await fetch(`${API_URL}/usage`, {
        method: 'GET',
        headers: {
          'X-Guest-Token': guestToken,
        },
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `서버 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      throw error;
    }
    throw new Error('사용량 조회 중 오류가 발생했습니다.');
  }
}

/**
 * Guest Token 내보내기 (tarotService에서 사용)
 */
export { getGuestToken };
