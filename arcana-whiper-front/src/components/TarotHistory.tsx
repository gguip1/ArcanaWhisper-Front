import React, { useEffect, useState } from 'react';
import { FaRedo, FaArrowLeft, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import authService from '../services/authService';
import historyService, { HistoryItem, HistoryService } from '../services/historyService';
import TarotHistoryItem from './TarotHistoryItem';
import '../styles/TarotHistory.css';

interface TarotHistoryProps {
  onGoHome: () => void;
}

const TarotHistory: React.FC<TarotHistoryProps> = ({ onGoHome }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // 기본값: 최신순
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadHistory();
  }, []);
  
  // 히스토리 데이터 로드 함수
  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 로그인 상태 확인
      const currentUser = authService.currentUser;
      if (!currentUser) {
        setError('로그인이 필요한 서비스입니다.');
        setLoading(false);
        return;
      }
      
      // 사용자 ID와 공급자 정보 가져오기
      const userId = currentUser.uid;
      const provider = currentUser.provider;
      
      // 히스토리 데이터 요청
      const data = await historyService.getTarotHistory(userId, provider);
      setHistoryItems(data);
    } catch (err) {
      console.error('히스토리 로드 실패:', err);
      setError(err instanceof Error ? err.message : '기록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 정렬 순서 토글
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };
  
  // 정렬된 히스토리 아이템
  const sortedItems = HistoryService.sortHistoryItems([...historyItems], sortOrder);
  
  // 현재 페이지의 아이템
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
  
  // 전체 페이지 수
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  
  // 페이지네이션 핸들러
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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
        
        {/* 정렬 버튼을 헤더 아래로 이동하고 가운데 정렬 */}
        {historyItems.length > 0 && !loading && !error && (
          <div className="history-sort-container">
            <button 
              className="sort-button"
              onClick={toggleSortOrder}
              title={sortOrder === 'desc' ? '오래된순으로 정렬' : '최신순으로 정렬'}
            >
              {sortOrder === 'desc' ? (
                <>
                  <FaSortAmountDown className="button-icon" />
                  최신순
                </>
              ) : (
                <>
                  <FaSortAmountUp className="button-icon" />
                  오래된순
                </>
              )}
            </button>
          </div>
        )}
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
            onClick={loadHistory}
          >
            <FaRedo className="button-icon" />
            다시 시도
          </button>
        </div>
      ) : historyItems.length === 0 ? (
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
            {currentItems.map((item, index) => (
              <TarotHistoryItem 
                key={`${item.question}-${item.created_at}`}
                item={item}
                index={indexOfFirstItem + index + 1}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TarotHistory;
