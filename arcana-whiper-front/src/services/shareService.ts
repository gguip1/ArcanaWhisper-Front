/**
 * 공유 링크 API 서비스
 */

import { auth } from './authService';
import { getGuestToken } from './usageService';
import { CreateShareResponse, SharedReading } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * 공유 링크 생성
 * @param historyId - 히스토리 ID
 * @returns share_id
 */
export async function createShareLink(historyId: string): Promise<string> {
  const idToken = await auth.currentUser?.getIdToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  } else {
    headers['X-Guest-Token'] = getGuestToken();
  }

  const response = await fetch(`${API_URL}/readings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ history_id: historyId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '공유 링크 생성에 실패했습니다.');
  }

  const data: CreateShareResponse = await response.json();
  return data.share_id;
}

/**
 * 공유된 리딩 결과 조회 (인증 불필요)
 * @param shareId - 공유 ID
 * @returns 리딩 결과
 */
export async function getSharedReading(shareId: string): Promise<SharedReading> {
  const response = await fetch(`${API_URL}/readings/${shareId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('리딩 결과를 찾을 수 없거나 만료되었습니다.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '리딩 결과를 불러오는데 실패했습니다.');
  }

  return await response.json();
}

/**
 * 공유 URL 생성
 * @param shareId - 공유 ID
 * @returns 전체 공유 URL
 */
export function getShareUrl(shareId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/${shareId}`;
}
