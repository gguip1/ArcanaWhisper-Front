import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { ROUTES } from '../constants';

// 페이지 컴포넌트들을 lazy loading으로 불러오기 (성능 최적화)
const HomePage = lazy(() => import('../pages/HomePage'));
const QuestionPage = lazy(() => import('../pages/QuestionPage'));
const CardSelectionPage = lazy(() => import('../pages/CardSelectionPage'));
const ResultPage = lazy(() => import('../pages/ResultPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));

// 에러 바운더리를 위한 컴포넌트
const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="error-container">
    <h2>페이지 로딩 중 오류가 발생했습니다</h2>
    <p>{error.message}</p>
    <button onClick={() => window.location.reload()}>
      페이지 새로고침
    </button>
  </div>
);

// 커스텀 에러 바운더리
class RouterErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Router Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <RouterErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.QUESTION} element={<QuestionPage />} />
            <Route path={ROUTES.CARDS} element={<CardSelectionPage />} />
            <Route path={ROUTES.RESULT} element={<ResultPage />} />
            <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
            {/* 404 페이지 - 홈으로 리다이렉트 */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </RouterErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;
