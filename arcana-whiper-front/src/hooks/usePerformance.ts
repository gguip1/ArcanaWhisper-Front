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

// 메모리 사용량 모니터링 훅
export const useMemoryMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as unknown as { memory: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        }}).memory;
        console.log('🧠 [Memory Usage]:', {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        });
      };      const interval = setInterval(checkMemory, 10000); // 10초마다 체크
      return () => clearInterval(interval);
    }
  }, []);
};

// 리렌더링 최적화 체크 훅
export const useRenderOptimization = (componentName: string, dependencies: unknown[]) => {
  const prevDependencies = useRef<unknown[]>([]);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      const changedDeps = dependencies.filter((dep, index) => 
        dep !== prevDependencies.current[index]
      );
      
      if (changedDeps.length > 0) {
        console.log(`🔄 [Render] ${componentName} (${renderCount.current})`, {
          changedDependencies: changedDeps,
          allDependencies: dependencies
        });
      }
    }
    
    prevDependencies.current = dependencies;
  });
};

// // 리렌더링 최적화 체크 훅
// export const useRenderOptimization = (componentName: string, dependencies: unknown[]) => {
//   const prevDependencies = useRef<unknown[]>([]);
//   const renderCount = useRef<number>(0);

//   useEffect(() => {
//     renderCount.current += 1;
    
//     if (process.env.NODE_ENV === 'development') {
//       const changedDeps = dependencies.filter((dep, index) => 
//         dep !== prevDependencies.current[index]
//       );
      
//       if (changedDeps.length > 0) {
//         console.log(`🔄 [Render] ${componentName} (${renderCount.current})`, {
//           changedDependencies: changedDeps,
//           allDependencies: dependencies
//         });
//       }
//     }
    
//     prevDependencies.current = dependencies;
//   });
// };
