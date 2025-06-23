import React from 'react';
import './App.css';
import { TarotProvider } from './contexts/TarotContext';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './components/AppRouter';
import { GlobalErrorModal } from './components/ErrorModal';
import LoginButton from './components/LoginButton';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// 메인 앱 콘텐츠 컴포넌트
const AppContent: React.FC = () => {
  const handleViewHistory = () => {
    // 히스토리 페이지로 이동하는 로직은 라우터에서 처리
    window.location.href = '/history';
  };

  return (
    <div className="app-container">
      {/* 로그인 버튼 */}
      <LoginButton 
        position="fixed" 
        providers={['google', 'kakao']} 
        onViewHistory={handleViewHistory}
        currentPage="home" // 라우터를 사용하므로 현재 페이지는 라우터에서 관리
      />
      
      {/* 메인 라우터 */}
      <AppRouter />
      
      {/* 글로벌 에러 모달 */}
      <GlobalErrorModal />

      {/* PWA 설치 프롬프트 */}
      <PWAInstallPrompt />
    </div>
  );
};

// 메인 App 컴포넌트
const App: React.FC = () => {
  return (
    <AuthProvider>
      <TarotProvider>
        <AppContent />
      </TarotProvider>
    </AuthProvider>
  );
};

export default App;
