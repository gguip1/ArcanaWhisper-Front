/**
 * 카카오톡 공유 서비스
 */

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: KakaoShareOptions) => void;
      };
    };
  }
}

interface KakaoShareOptions {
  objectType: 'feed';
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      webUrl: string;
      mobileWebUrl: string;
    };
  };
  buttons?: Array<{
    title: string;
    link: {
      webUrl: string;
      mobileWebUrl: string;
    };
  }>;
}

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

let isKakaoLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * 카카오 SDK 스크립트 로드
 */
function loadKakaoScript(): Promise<void> {
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    if (window.Kakao) {
      isKakaoLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    script.crossOrigin = 'anonymous';
    script.async = true;

    script.onload = () => {
      isKakaoLoaded = true;
      resolve();
    };

    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('카카오 SDK 로드에 실패했습니다.'));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
}

/**
 * 카카오 SDK 초기화
 */
export async function initKakao(): Promise<boolean> {
  if (!KAKAO_JS_KEY) {
    console.warn('카카오 JavaScript 키가 설정되지 않았습니다.');
    return false;
  }

  try {
    await loadKakaoScript();

    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }

    return window.Kakao?.isInitialized() ?? false;
  } catch (error) {
    console.error('카카오 SDK 초기화 실패:', error);
    return false;
  }
}

/**
 * 카카오 SDK 초기화 여부 확인
 */
export function isKakaoInitialized(): boolean {
  return isKakaoLoaded && window.Kakao?.isInitialized() === true;
}

/**
 * 카카오톡으로 공유 (동기적 실행 - 사용자 제스처 컨텍스트 유지 필요)
 * @param shareUrl - 공유 URL
 * @param question - 질문 (미리보기용)
 */
export function shareToKakao(shareUrl: string, question: string): void {
  if (!isKakaoInitialized()) {
    // SDK가 초기화되지 않았으면 초기화 시도 후 공유
    initKakao().then(initialized => {
      if (initialized) {
        executeKakaoShare(shareUrl, question);
      } else {
        console.error('카카오톡 공유를 사용할 수 없습니다.');
      }
    });
    return;
  }

  executeKakaoShare(shareUrl, question);
}

/**
 * 실제 카카오톡 공유 실행
 */
function executeKakaoShare(shareUrl: string, question: string): void {
  const truncatedQuestion = question.length > 50
    ? question.substring(0, 47) + '...'
    : question;

  const baseUrl = window.location.origin;
  const ogImageUrl = `${baseUrl}/og-share.png`;

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: 'ArcanaWhisper - 타로 리딩 결과',
      description: truncatedQuestion,
      imageUrl: ogImageUrl,
      link: {
        webUrl: shareUrl,
        mobileWebUrl: shareUrl,
      },
    },
    buttons: [
      {
        title: '결과 보기',
        link: {
          webUrl: shareUrl,
          mobileWebUrl: shareUrl,
        },
      },
    ],
  });
}

/**
 * 카카오톡 공유 가능 여부 확인
 */
export function canShareToKakao(): boolean {
  return !!KAKAO_JS_KEY;
}
