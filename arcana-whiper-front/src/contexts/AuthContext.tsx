import { createContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthProvider as AuthProviderType } from '../types';
import authService from '../services/authService';

// Context 타입 정의
interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (provider: AuthProviderType) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  isLoggedIn: boolean;
}

// Context 생성
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props 타입
interface AuthProviderProps {
  children: ReactNode;
}

// Provider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      // Auth 초기화 완료 대기
      await authService.waitForAuthReady();

      // 인증 서비스 구독
      unsubscribe = authService.subscribe((userData) => {
        setUser(userData);
      });

      // 초기 사용자 정보 설정 후 로딩 완료
      setUser(authService.currentUser);
      setIsLoading(false);
    };

    initAuth();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const signIn = async (provider: AuthProviderType): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const userData = await authService.signIn(provider);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signOut,
    isLoggedIn: user !== null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
