import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaHome, FaMagic } from 'react-icons/fa';
import { shuffleCards } from '../data/tarotData';
import TarotResultCard from './TarotResultCard';

// 카드 정보 타입 정의 (App.tsx와 일치해야 함)
interface SelectedCardInfo {
  id: number;
  number: number;
  reversed: boolean;
}

interface ReadingResultProps {
  markdown: string;
  onNewReading: () => void;
  onGoHome: () => void;
  question?: string;
  selectedCardInfos?: SelectedCardInfo[]; // 방향 정보를 포함한 카드 정보
}

const ReadingResult: React.FC<ReadingResultProps> = ({ 
  markdown, 
  onNewReading,
  onGoHome,
  question = '',
  selectedCardInfos = []
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // 페이지 로드시 효과 적용
  useEffect(() => {
    // 페이지 최상단으로 스크롤
    window.scrollTo(0, 0);
    
    // 첫 번째 단락에 스타일 적용
    if (contentRef.current) {
      const firstParagraph = contentRef.current.querySelector('p');
      if (firstParagraph) {
        firstParagraph.classList.add('first-paragraph');
      }
    }
  }, []);

  // 홈 버튼 클릭 효과 처리
  const handleHomeButtonClick = () => {
    onGoHome();
  };

  // 카드 포지션 정의
  const positions = ["첫번째", "두번째", "세번째"];
  
  // 전체 카드 데이터 가져오기
  const allCards = shuffleCards();
  
  // 선택한 카드 정보 가져오기
  const selectedCards = selectedCardInfos.map(cardInfo => {
    const card = allCards.find(c => c.id === cardInfo.id);
    return card ? { ...card, reversed: cardInfo.reversed } : undefined;
  }).filter(card => card !== undefined); // undefined 필터링

  return (
    <div className="reading-result-container">
      {/* 홈으로 돌아가는 버튼 */}
      <button 
        className="home-button"
        onClick={handleHomeButtonClick}
        title="홈으로 돌아가기"
        aria-label="홈으로 돌아가기"
      >
        <FaHome className="home-icon" />
        <span className="home-text">홈</span>
      </button>

      <div className="reading-header">
        <h1 className="reading-title">타로 카드 해석</h1>
      </div>
      
      {/* 질문 영역 */}
      {question && (
        <div className="content-card question-section fade-in">
          <h2 className="section-title">당신의 질문</h2>
          <div className="reading-question">
            <div className="question-text">{question}</div>
          </div>
        </div>
      )}
      
      {/* 영역 연결 요소 */}
      <div className="section-connector"></div>
      
      {/* 카드 영역 - 테두리 제거 */}
      <div className="content-card card-section fade-in" style={{animationDelay: '0.2s'}}>
        <h2 className="section-title">선택한 카드</h2>
        <div className="cards-container">
          {selectedCards.length > 0 && (
            <div className="selected-tarot-cards">
              {selectedCards.map((card, index) => card && (
                <TarotResultCard
                  key={card.id}
                  name={card.name}
                  number={card.number}
                  description={card.description}
                  image={card.image}
                  position={positions[index % positions.length]}
                  reversed={card.reversed} // 역방향 정보 전달
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 영역 연결 요소 */}
      <div className="section-connector"></div>
      
      {/* 결과 영역 - 이중 테두리 제거 */}
      <div className="content-card result-section fade-in" style={{animationDelay: '0.4s'}}>
        <h2 className="section-title">카드 해석 결과</h2>
        <div className="reading-content" ref={contentRef}>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
      
      <div className="reading-actions fade-in" style={{animationDelay: '0.5s'}}>
        <button 
          className="reading-action-btn primary-action" 
          onClick={onNewReading}
          aria-label="새로운 타로 카드 리딩 시작하기"
        >
          <FaMagic /> <span className="btn-text">새로운 운명 읽기</span>
        </button>
      </div>
    </div>
  );
};

export default ReadingResult;
