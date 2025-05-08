import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    // PWA 설치 프롬프트 이벤트 처리
    const handleInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // 브라우저 기본 프롬프트 방지
      window.deferredPrompt = e; // 나중에 사용할 수 있도록 저장
      
      // 5초 후 커스텀 설치 프롬프트 표시
      setTimeout(() => {
        if (window.deferredPrompt) {
          setShowPrompt(true);
        }
      }, 5000);
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

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 이미 설치되었거나 최근에 안내한 경우 체크
    const checkIfShouldPrompt = () => {
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
  }, []);

  // 설치 버튼 클릭 처리
  const handleInstall = async () => {
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
    // 닫기 선택 시 일정 기간(3일) 동안 표시 안 함
    try {
      localStorage.setItem('pwaPromptDismissed', Date.now().toString());
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
          <button className="pwa-prompt-install" onClick={handleInstall}>
            앱으로 설치하기
          </button>
        </div>
      </div>

      <style jsx>{`
        .pwa-prompt-container {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 380px;
          background: rgba(30, 30, 46, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          z-index: 9999;
          animation: slide-up 0.5s ease;
          border: 1px solid rgba(156, 39, 176, 0.3);
          overflow: hidden;
        }
        
        .pwa-prompt-content {
          padding: 16px;
        }
        
        .pwa-prompt-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          position: relative;
        }
        
        .pwa-prompt-icon {
          font-size: 24px;
          margin-right: 12px;
        }
        
        .pwa-prompt-title {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .pwa-prompt-title strong {
          color: #d4b2ff;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .pwa-prompt-title span {
          color: #a8a8a8;
          font-size: 14px;
        }
        
        .pwa-prompt-close {
          position: absolute;
          top: 0;
          right: 0;
          background: transparent;
          border: none;
          color: #a8a8a8;
          font-size: 20px;
          padding: 0;
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .pwa-prompt-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .pwa-prompt-body {
          text-align: center;
        }
        
        .pwa-prompt-install {
          background: linear-gradient(90deg, #9c27b0 0%, #673ab7 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          width: 100%;
          border-radius: 8px;
          font-weight: bold;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .pwa-prompt-install:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(156, 39, 176, 0.3);
        }
        
        @keyframes slide-up {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;
