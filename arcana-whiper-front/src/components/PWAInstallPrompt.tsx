import React, { useState, useEffect } from 'react';
import '../styles/PWAInstallPrompt.css';

// 설치 프롬프트 이벤트 인터페이스 정의
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// 전역 타입 확장
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    // iOS 디바이스 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
    
    // 이미 설치되어 있는지 확인 (standalone 모드)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    
    // PWA 설치 프롬프트 이벤트 처리
    const handleInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // 브라우저 기본 프롬프트 방지
      window.deferredPrompt = e; // 나중에 사용할 수 있도록 저장
      
      // 3초 후 커스텀 설치 프롬프트 표시
      setTimeout(() => {
        if (window.deferredPrompt) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // 이미 설치된 경우 처리
    const handleAppInstalled = () => {
      window.deferredPrompt = undefined;
      setShowPrompt(false);
      // 설치 완료 후 로컬 스토리지에 저장 (14일 동안 프롬프트 표시 안 함)
      try {
        localStorage.setItem('pwaInstalled', Date.now().toString());
      } catch (e) {
        console.error('LocalStorage 접근 에러:', e);
      }
    };

    // iOS에서 설치 가이드 표시 조건
    const shouldShowIOSGuide = () => {
      if (!isIOSDevice || isStandalone) return false;
      
      try {
        const dismissedTimestamp = localStorage.getItem('pwaIOSDismissed');
        if (dismissedTimestamp) {
          // 3일(259200000ms) 지났는지 확인
          if (Date.now() - Number(dismissedTimestamp) < 259200000) {
            return false; // 3일 안 지났으면 표시 안 함
          }
        }
        
        return true; // 그 외 경우에는 표시
      } catch (e) {
        return true; // 에러 발생시 기본값으로 표시
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 이미 설치되었거나 최근에 안내한 경우 체크
    const checkIfShouldPrompt = () => {
      // iOS인 경우 별도 로직
      if (isIOSDevice) {
        if (shouldShowIOSGuide()) {
          // 5초 후 iOS 설치 안내 표시
          setTimeout(() => {
            setShowPrompt(true);
          }, 5000);
        }
        return;
      }
      
      try {
        const installedTimestamp = localStorage.getItem('pwaInstalled');
        if (installedTimestamp) {
          // 14일(1209600000ms) 지났는지 확인
          if (Date.now() - Number(installedTimestamp) < 1209600000) {
            return false; // 14일 안 지났으면 표시 안 함
          }
        }
        
        // 이미 스탠드얼론 모드로 실행 중인지 확인
        if (window.matchMedia('(display-mode: standalone)').matches) {
          return false; // 이미 설치되어 실행 중이면 표시 안 함
        }
        
        return true; // 그 외 경우에는 표시
      } catch (e) {
        console.error('LocalStorage 접근 에러:', e);
        return true; // 에러 발생시 기본값으로 표시
      }
    };
    
    // 초기 체크
    if (!checkIfShouldPrompt()) {
      setShowPrompt(false);
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  // 설치 버튼 클릭 처리
  const handleInstall = async () => {
    if (isIOS) {
      // iOS에서는 상세 안내 표시
      setShowManualInstructions(true);
      return;
    }
    
    if (!window.deferredPrompt) return;
    
    try {
      await window.deferredPrompt.prompt(); // 설치 프롬프트 표시
      const choiceResult = await window.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('사용자가 PWA 설치 수락');
      } else {
        console.log('사용자가 PWA 설치 거부');
        // 사용자가 취소한 경우 나중에 다시 표시할 수 있도록 설정
        try {
          localStorage.setItem('pwaPromptDismissed', Date.now().toString());
        } catch (e) {
          console.error('LocalStorage 접근 에러:', e);
        }
      }
    } catch (e) {
      console.error('설치 프롬프트 오류:', e);
    }
    
    // 프롬프트는 한 번만 사용 가능하므로 참조 삭제
    window.deferredPrompt = undefined;
    setShowPrompt(false);
  };

  // 프롬프트 닫기 처리
  const handleClose = () => {
    setShowPrompt(false);
    setShowManualInstructions(false);
    
    // 닫기 선택 시 일정 기간 동안 표시 안 함
    try {
      if (isIOS) {
        localStorage.setItem('pwaIOSDismissed', Date.now().toString());
      } else {
        localStorage.setItem('pwaPromptDismissed', Date.now().toString());
      }
    } catch (e) {
      console.error('LocalStorage 접근 에러:', e);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-prompt-container">
      <div className="pwa-prompt-content">
        <div className="pwa-prompt-header">
          <div className="pwa-prompt-icon">🔮</div>
          <div className="pwa-prompt-title">
            <strong>앱으로 설치하기</strong>
            <span>더 빠르게 타로를 이용하세요</span>
          </div>
          <button className="pwa-prompt-close" onClick={handleClose} aria-label="닫기">×</button>
        </div>
        
        <div className="pwa-prompt-body">
          {isIOS && !showManualInstructions ? (
            <button className="pwa-prompt-install" onClick={handleInstall}>
              설치 방법 보기
            </button>
          ) : isIOS && showManualInstructions ? (
            <div className="pwa-ios-instructions">
              <p className="pwa-instruction-step">
                1. Safari 브라우저 하단의 <span className="pwa-icon-example">공유 아이콘 <span className="share-icon">↑</span></span>을 탭하세요
              </p>
              <p className="pwa-instruction-step">
                2. 스크롤하여 <span className="pwa-highlight">"홈 화면에 추가"</span>를 탭하세요
              </p>
              <p className="pwa-instruction-step">
                3. 오른쪽 상단의 <span className="pwa-highlight">"추가"</span>를 탭하세요
              </p>
            </div>
          ) : (
            <button className="pwa-prompt-install" onClick={handleInstall}>
              앱으로 설치하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
