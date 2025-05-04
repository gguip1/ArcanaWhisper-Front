import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FaRedo, FaArrowLeft } from 'react-icons/fa';
import authService from '../services/authService';
import historyService, { HistoryItem } from '../services/historyService';
import errorService from '../services/errorService';
import TarotHistoryItem from './TarotHistoryItem';
import '../styles/TarotHistory.css';

interface TarotHistoryProps {
  onGoHome: () => void;
}

const TarotHistory: React.FC<TarotHistoryProps> = ({ onGoHome }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // 기본값: 최신순
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true); // 추가 데이터가 있는지 여부
  
  // 스크롤 감지를 위한 ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadHistory();
  }, []);
  
  // 히스토리 데이터 로드 함수
  const loadHistory = async (cursorDocId?: string) => {
    try {
      if (!cursorDocId) {
        setLoading(true);  // 초기 로드시에만 전체 로딩 표시
      } else {
        setLoadingMore(true);  // 추가 데이터 로드시 하단 로딩만 표시
      }
      
      setError(null);
      
      // 로그인 상태 확인
      const currentUser = authService.currentUser;
      if (!currentUser) {
        errorService.showError('로그인이 필요한 서비스입니다.', 0, onGoHome);
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      
      // 사용자 ID와 공급자 정보 가져오기
      const userId = currentUser.uid;
      const provider = currentUser.provider;
      
      // 히스토리 데이터 요청
      const response = await historyService.getTarotHistory(userId, provider, cursorDocId);
      
      // 응답 구조에 따라 데이터 처리
      if (response && typeof response === 'object' && 'history' in response) {
        // 커서가 없으면 초기 로드, 있으면 추가 데이터 로드
        if (!cursorDocId) {
          setHistoryItems(response.history);
        } else {
          // 기존 아이템에 새 아이템 추가
          setHistoryItems(prev => [...prev, ...response.history]);
        }
        
        // 다음 커서 설정
        setNextCursor(response.next_cursor_doc_id);
        
        // 더 불러올 데이터가 있는지 확인
        setHasMore(!!response.next_cursor_doc_id);
      } else {
        // 예전 API 형식과의 호환성을 위한 처리 (배열로 반환되는 경우)
        if (!cursorDocId) {
          setHistoryItems(Array.isArray(response) ? response : []);
        } else {
          setHistoryItems(prev => [...prev, ...(Array.isArray(response) ? response : [])]);
        }
        setHasMore(false);  // 배열 형태로 반환되면 더 이상 데이터가 없다고 가정
      }
    } catch (err) {
      console.error('히스토리 로드 실패:', err);
      const errorMessage = err instanceof Error ? err.message : '기록을 불러오는 중 오류가 발생했습니다.';
      errorService.showError(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  // 정렬된 히스토리 아이템
  const sortedItems = [...historyItems].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });
  
  // 스크롤 감지를 위한 Intersection Observer 설정
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && hasMore && !loadingMore && !loading && nextCursor) {
        // 화면에 로딩 요소가 보이고, 추가 데이터가 있을 때 로드
        loadHistory(nextCursor);
      }
    },
    [hasMore, loadingMore, loading, nextCursor]
  );
  
  // Observer 설정
  useEffect(() => {
    // 이전 Observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // 새 Observer 생성
    observerRef.current = new IntersectionObserver(observerCallback, {
      root: null,  // viewport를 root로 사용
      rootMargin: '0px',
      threshold: 1.0  // 완전히 보일 때 콜백 실행
    });
    
    // 로딩 요소가 있으면 관찰 시작
    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [observerCallback]);

  return (
    <div className="tarot-history-container">
      <button 
        className="home-button"
        onClick={onGoHome}
        title="홈으로 돌아가기"
      >
        <FaArrowLeft className="button-icon" />
        <span className="home-text">돌아가기</span>
      </button>
      
      <div className="history-header">
        <h1 className="history-title">타로 카드 기록</h1>
        <p className="history-subtitle">당신의 질문과 타로의 지혜를 모아봤어요</p>
      </div>
      
      {loading ? (
        <div className="history-loading">
          <div className="loader"></div>
          <p>기록을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="history-error">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => loadHistory()}
          >
            <FaRedo className="button-icon" />
            다시 시도
          </button>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="history-empty">
          <p>아직 타로 카드 기록이 없습니다.</p>
          <p>질문하고 타로 카드의 지혜를 들어보세요.</p>
          <button 
            className="start-reading-button"
            onClick={onGoHome}
          >
            첫 타로 카드 읽기 시작하기
          </button>
        </div>
      ) : (
        <>
          <div className="history-list">
            {sortedItems.map((item, index) => (
              <TarotHistoryItem 
                key={`${item.question}-${item.created_at}-${index}`}
                item={item}
                index={index + 1}
              />
            ))}
            
            {/* 스크롤 로딩을 위한 관찰 대상 요소 */}
            {hasMore && (
              <div 
                ref={loadingRef} 
                className={`scroll-loader ${loadingMore ? 'visible' : ''}`}
              >
                {loadingMore && (
                  <>
                    <div className="loader small-loader"></div>
                    <p>더 불러오는 중...</p>
                  </>
                )}
              </div>
            )}
            
            {/* 모든 기록을 불러왔을 때 표시할 메시지 */}
            {!hasMore && sortedItems.length > 0 && (
              <div className="history-end-message">
                <p>모든 타로 카드 기록을 불러왔습니다.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TarotHistory;
