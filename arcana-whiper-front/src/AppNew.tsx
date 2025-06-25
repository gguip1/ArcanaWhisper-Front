import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { TarotProvider } from './contexts/TarotContext';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './components/AppRouter';
import { GlobalErrorModal } from './components/ErrorModal';
import LoginButton from './components/LoginButton';
import LanguageToggle from './components/LanguageToggle';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// 메인 앱 콘텐츠 컴포넌트 (Router 컨텍스트 내부)
const AppContent: React.FC = () => {
  return (
    <div className="app-container">
      {/* 언어 전환 버튼 */}
      <LanguageToggle />
      
      {/* 로그인 버튼 - Router 컨텍스트 내부에서 렌더링 */}
      <LoginButton 
        position="fixed" 
        providers={['google', 'kakao']} 
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
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TarotProvider>
    </AuthProvider>
  );
};

export default App;
