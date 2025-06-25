import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService, { AuthProvider, UserProfile } from '../services/authService';
import errorService from '../services/errorService'; // 에러 서비스 추가
import { FaGoogle, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import { SiKakao } from 'react-icons/si';
import '../styles/LoginButton.css';

interface LoginButtonProps {
  className?: string;
  position?: 'fixed' | 'absolute' | 'static';
  providers?: AuthProvider[];
  onViewHistory?: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  className = '',
  position = 'fixed',
  providers = ['google', 'kakao'],
  onViewHistory
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // 초기 로딩 상태 추가
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 즉시 로컬 스토리지에서 사용자 정보 확인
  useEffect(() => {
    // 현재 사용자 확인 (로컬 스토리지에서 가져옴)
    const currentUser = authService.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
    
    // 인증 상태 변경 구독
    const unsubscribe = authService.subscribe(currentUser => {
      setUser(currentUser);
      setInitialLoading(false); // 인증 상태 확인 완료
    });
    
    // 일정 시간 후 로딩 상태 해제 (최대 대기 시간)
    const timeoutId = setTimeout(() => {
      setInitialLoading(false);
    }, 500);
    
    // 드롭다운 외부 클릭 처리
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleOutsideClick);
      clearTimeout(timeoutId);
    };
  }, []);

  // 로그인 처리
  const handleLogin = async (provider: AuthProvider) => {
    try {
      setLoading(true);
      await authService.signIn(provider);
      setShowDropdown(false);
    } catch (err) {
      console.error('로그인 실패:', err);
      // 에러 서비스를 통해 에러 표시
      errorService.showError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setShowDropdown(false);
    } catch (err) {
      console.error('로그아웃 실패:', err);
      // 에러 서비스를 통해 에러 표시
      errorService.showError(err instanceof Error ? err.message : '로그아웃 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 제공자별 아이콘 렌더링
  const renderProviderIcon = (provider: AuthProvider) => {
    switch (provider) {
      case 'google': return <FaGoogle className="provider-icon" />;
      // case 'facebook': return <FaFacebook className="provider-icon" />;
      // case 'github': return <FaGithub className="provider-icon" />;
      case 'kakao': return <SiKakao className="provider-icon" />;
      default: return null;
    }
  };

  // 제공자 이름 가져오기
  const getProviderName = (provider: AuthProvider): string => {
    switch (provider) {
      case 'google': return 'Google';
      case 'facebook': return 'Facebook';
      case 'github': return 'GitHub';
      case 'kakao': return '카카오';
      case 'microsoft': return 'Microsoft';
      case 'apple': return 'Apple';
      default: return provider;
    }
  };

  const positionClass = position === 'fixed' ? 'login-button-fixed' : 
                        position === 'absolute' ? 'login-button-absolute' : '';

  // 히스토리 보기 버튼 클릭 핸들러
  const handleViewHistory = () => {
    setShowDropdown(false); // 드롭다운 닫기
    if (onViewHistory) {
      onViewHistory();
    } else {
      navigate('/history');
    }
  };

  // 히스토리 페이지인지 확인
  const isHistoryPage = location.pathname === '/history';

  // 로그인 버튼 렌더링 최적화
  const renderLoginButton = () => {
    // 초기 로딩 중이면 원형 로더 표시
    if (initialLoading) {
      return <div className="initializing-button"></div>;
    }
    
    // 작업 중 로딩
    if (loading) {
      return <span className="loading-spinner"></span>;
    }
    
    // 로그인된 상태
    if (user) {
      return user.photoURL ? (
        <img 
          src={user.photoURL} 
          alt={user.displayName || t('auth.profile')} 
          className="user-avatar" 
        />
      ) : (
        <span className="user-initial">
          {user.displayName?.[0] || user.email?.[0] || '?'}
        </span>
      );
    }
    
    // 로그아웃 상태
    return (
      <>
        <span className="login-icon"></span>
        <span className="login-text">{t('auth.loginButton')}</span>
      </>
    );
  };

  // 버튼 클래스 계산 - 항상 원형 유지
  const buttonClass = `login-button ${user ? 'logged-in' : ''} ${initialLoading ? 'initializing' : ''}`;

  return (
    <div className={`login-button-container ${positionClass} ${className}`} ref={dropdownRef}>
      <button 
        className={buttonClass}
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading || initialLoading}
        aria-label={user ? t('auth.profile') : t('auth.loginButton')}
      >
        {renderLoginButton()}
      </button>

      {showDropdown && (
        <div className="login-dropdown">
          {user ? (
            // 로그인 상태 - 사용자 정보 및 로그아웃 버튼
            <>
              <div className="dropdown-header">
                <div className="user-info">
                  <div className="user-name">{user.displayName || t('auth.profile')}</div>
                  {user.email && <div className="user-email">{user.email}</div>}
                  <div className="user-provider">
                    {user.provider === 'google.com' ? 'Google' : 
                     user.provider === 'facebook.com' ? 'Facebook' : 
                     user.provider === 'github.com' ? 'GitHub' :
                     user.provider === 'kakao' ? 'Kakao' : 
                     user.provider}
                  </div>
                </div>
              </div>
              <div className="dropdown-actions">
                {/* 현재 페이지가 히스토리 페이지가 아닐 때만 히스토리 버튼 표시 */}
                {!isHistoryPage && (
                  <button 
                    className="history-button"
                    onClick={handleViewHistory}
                    disabled={loading}
                  >
                    <FaHistory className="button-icon" />
                    {t('auth.historyButton')}
                  </button>
                )}
                
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  <FaSignOutAlt className="button-icon" />
                  {t('auth.logoutButton')}
                </button>
              </div>
            </>
          ) : (
            // 로그아웃 상태 - 로그인 옵션 목록
            <>
              <div className="dropdown-header">{t('auth.loginMethod')}</div>
              <div className="dropdown-providers">
                {providers.map(provider => (
                  <button
                    key={provider}
                    className={`provider-button provider-${provider}`}
                    onClick={() => handleLogin(provider)}
                    disabled={loading}
                  >
                    {renderProviderIcon(provider)}
                    <span>{t('auth.loginWith', { provider: getProviderName(provider) })}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginButton;
