import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService, { UserProfile } from '../services/authService';
import errorService from '../services/errorService';
import { FaGoogle, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import '../styles/LoginButton.css';

interface LoginButtonProps {
  className?: string;
  position?: 'fixed' | 'absolute' | 'static';
  onViewHistory?: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  className = '',
  position = 'fixed',
  onViewHistory
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = authService.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }

    const unsubscribe = authService.subscribe(currentUser => {
      setUser(currentUser);
      setInitialLoading(false);
    });

    const timeoutId = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

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

  const handleLogin = async () => {
    try {
      setLoading(true);
      await authService.signIn('google');
      setShowDropdown(false);
    } catch (err) {
      errorService.showError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setShowDropdown(false);
    } catch (err) {
      errorService.showError(err instanceof Error ? err.message : '로그아웃 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const positionClass = position === 'fixed' ? 'login-button-fixed' :
    position === 'absolute' ? 'login-button-absolute' : '';

  const handleViewHistory = () => {
    setShowDropdown(false);
    if (onViewHistory) {
      onViewHistory();
    } else {
      navigate('/history');
    }
  };

  const isHistoryPage = location.pathname === '/history';

  const renderLoginButton = () => {
    if (initialLoading) {
      return <div className="initializing-button"></div>;
    }

    if (loading) {
      return <span className="loading-spinner"></span>;
    }

    if (user) {
      return user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || '프로필'}
          className="user-avatar"
        />
      ) : (
        <span className="user-initial">
          {user.displayName?.[0] || user.email?.[0] || '?'}
        </span>
      );
    }

    return (
      <>
        <span className="login-icon"></span>
        <span className="login-text">로그인</span>
      </>
    );
  };

  const buttonClass = `login-button ${user ? 'logged-in' : ''} ${initialLoading ? 'initializing' : ''}`;

  return (
    <div className={`login-button-container ${positionClass} ${className}`} ref={dropdownRef}>
      <button
        className={buttonClass}
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading || initialLoading}
        aria-label={user ? '프로필' : '로그인'}
      >
        {renderLoginButton()}
      </button>

      {showDropdown && (
        <div className="login-dropdown">
          {user ? (
            <>
              <div className="dropdown-header">
                <div className="user-info">
                  <div className="user-name">{user.displayName || '프로필'}</div>
                  {user.email && <div className="user-email">{user.email}</div>}
                  <div className="user-provider">
                    {user.provider === 'google.com' ? 'Google' : user.provider}
                  </div>
                </div>
              </div>
              <div className="dropdown-actions">
                {!isHistoryPage && (
                  <button
                    className="history-button"
                    onClick={handleViewHistory}
                    disabled={loading}
                  >
                    <FaHistory className="button-icon" />
                    타로 기록 보기
                  </button>
                )}

                <button
                  className="logout-button"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  <FaSignOutAlt className="button-icon" />
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="dropdown-header">로그인 방법</div>
              <div className="dropdown-providers">
                <button
                  className="provider-button provider-google"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  <FaGoogle className="provider-icon" />
                  <span>Google로 로그인</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginButton;
