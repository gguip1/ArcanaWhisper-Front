import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // 로딩 중일 때는 null 반환 (Suspense fallback이 이미 로딩 처리)
  if (isLoading) {
    return null;
  }

  // 로그인되지 않은 경우 홈으로 리다이렉트
  if (!user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // 로그인된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;
