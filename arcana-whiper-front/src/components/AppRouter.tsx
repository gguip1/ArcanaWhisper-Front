import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { ROUTES } from '../constants';

// 페이지 컴포넌트들을 lazy loading으로 불러오기
const HomePage = lazy(() => import('../pages/HomePage'));
const QuestionPage = lazy(() => import('../pages/QuestionPage'));
const CardSelectionPage = lazy(() => import('../pages/CardSelectionPage'));
const ResultPage = lazy(() => import('../pages/ResultPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default AppRouter;
