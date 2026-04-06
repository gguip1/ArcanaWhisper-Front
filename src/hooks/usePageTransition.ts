import { useState, useCallback } from 'react';
import { PageType } from '../types';
import { TRANSITION_DURATION } from '../constants';

export const usePageTransition = (initialPage: PageType = 'home') => {
  const [currentPage, setCurrentPage] = useState<PageType>(initialPage);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetPage, setTargetPage] = useState<PageType>(initialPage);

  const startTransition = useCallback((nextPage: PageType) => {
    setTargetPage(nextPage);
    setIsTransitioning(true);
    
    // 목표 페이지를 먼저 설정하고, 약간의 지연 후에 전환 애니메이션을 종료
    setCurrentPage(nextPage);
    
    // 애니메이션 효과를 위한 타이머
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, []);

  const shouldShowTransition = useCallback((isLoading: boolean) => {
    // 로딩 중일 때는 항상 표시
    if (isLoading) return true;
    
    // 전환 중일 때만 표시 (페이지는 이미 변경되어 있음)
    return isTransitioning;
  }, [isTransitioning]);

  return {
    currentPage,
    isTransitioning,
    targetPage,
    startTransition,
    shouldShowTransition,
  };
};
