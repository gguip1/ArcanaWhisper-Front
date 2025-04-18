import { useState, useEffect, useRef } from 'react';
import authService, { AuthProvider, UserProfile } from '../services/authService';
import { FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';
import { SiKakao } from 'react-icons/si';
import '../styles/LoginButton.css';

interface LoginButtonProps {
  className?: string;
  position?: 'fixed' | 'absolute' | 'static';
  providers?: AuthProvider[];
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  className = '',
  position = 'fixed',
  providers = ['google', 'kakao']
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 인증 서비스 구독
    const unsubscribe = authService.subscribe(currentUser => {
      setUser(currentUser);
    });
    
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
    };
  }, []);

  // 오류 메시지 자동 제거
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 로그인 처리
  const handleLogin = async (provider: AuthProvider) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signIn(provider);
      setShowDropdown(false);
    } catch (err) {
      console.error('로그인 실패:', err);
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다');
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
      setError(err instanceof Error ? err.message : '로그아웃 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 제공자별 아이콘 렌더링
  const renderProviderIcon = (provider: AuthProvider) => {
    switch (provider) {
      case 'google': return <FaGoogle className="provider-icon" />;
      case 'facebook': return <FaFacebook className="provider-icon" />;
      case 'github': return <FaGithub className="provider-icon" />;
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

  return (
    <div className={`login-button-container ${positionClass} ${className}`} ref={dropdownRef}>
      <button 
        className={`login-button ${user ? 'logged-in' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        aria-label={user ? '사용자 메뉴' : '로그인'}
      >
        {loading ? (
          <span className="loading-spinner"></span>
        ) : user ? (
          user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || '사용자'} 
              className="user-avatar" 
            />
          ) : (
            <span className="user-initial">
              {user.displayName?.[0] || user.email?.[0] || '?'}
            </span>
          )
        ) : (
          <>
            <span className="login-icon"></span>
            <span className="login-text">로그인</span>
          </>
        )}
      </button>

      {showDropdown && (
        <div className="login-dropdown">
          {user ? (
            // 로그인 상태 - 사용자 정보 및 로그아웃 버튼
            <>
              <div className="dropdown-header">
                <div className="user-info">
                  <div className="user-name">{user.displayName || '사용자'}</div>
                  {user.email && <div className="user-email">{user.email}</div>}
                  <div className="user-provider">
                    {user.provider === 'google.com' ? 'Google' : 
                     user.provider === 'facebook.com' ? 'Facebook' : 
                     user.provider === 'github.com' ? 'GitHub' :
                     user.provider === 'kakao' ? '카카오' : 
                     user.provider}
                  </div>
                </div>
              </div>
              <div className="dropdown-actions">
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            // 로그아웃 상태 - 로그인 옵션 목록
            <>
              <div className="dropdown-header">로그인 방법</div>
              <div className="dropdown-providers">
                {providers.map(provider => (
                  <button
                    key={provider}
                    className={`provider-button provider-${provider}`}
                    onClick={() => handleLogin(provider)}
                    disabled={loading}
                  >
                    {renderProviderIcon(provider)}
                    <span>{getProviderName(provider)}로 로그인</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {error && <div className="login-error">{error}</div>}
    </div>
  );
};

export default LoginButton;
