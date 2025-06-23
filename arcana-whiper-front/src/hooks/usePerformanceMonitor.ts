import { useEffect, useRef, useCallback } from 'react';

// 함수 타입 정의
type AnyFunction = (...args: unknown[]) => unknown;

// 성능 모니터링 훅
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - renderStartTime.current;
    
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [Performance] ${componentName}:`, {
        renderTime: `${renderTime}ms`,
        renderCount: renderCount.current,
        timestamp: new Date().toISOString()
      });
    }
    
    // 렌더링 시간이 100ms를 초과하면 경고
    if (renderTime > 100) {
      console.warn(`⚠️ [Performance Warning] ${componentName} took ${renderTime}ms to render`);
    }
  });

  // 렌더링 시작 시간 업데이트
  renderStartTime.current = Date.now();

  // 성능 측정 함수 반환
  const measureFunction = useCallback(<T extends AnyFunction>(
    fn: T,
    functionName: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 [Function Performance] ${componentName}.${functionName}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  }, [componentName]);

  return { measureFunction };
};
