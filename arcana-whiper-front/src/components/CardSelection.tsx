import React, { useEffect, useState, useRef } from 'react';
import TarotCard from './TarotCard';
import { shuffleCards } from '../data/tarotData';
import { FaArrowRight, FaRedo, FaArrowLeft } from 'react-icons/fa'; // FaHome을 FaArrowLeft로 변경
import { FiShuffle } from 'react-icons/fi';

// props 인터페이스 업데이트 - 질문 다시하기 추가
interface CardSelectionProps {
  selectedCards: number[];
  onCardSelect: (cardId: number) => void;
  maxCards: number;
  onResetCards?: () => void;
  onRequestReading?: (cardNumbers: number[]) => void; 
  onGoHome?: () => void;
  onReQuestion?: () => void; // 질문 다시하기 핸들러 추가
  question?: string;
}

const CardSelection: React.FC<CardSelectionProps> = ({ 
  selectedCards, 
  onCardSelect,
  maxCards,
  onResetCards,
  onRequestReading,
  // onGoHome,
  onReQuestion, // 질문 다시하기 핸들러
  // question = ''
}) => {
  const [cardPositions, setCardPositions] = useState<{[key: number]: {x: number, y: number, rotation: number, baseZIndex: number}}>({});
  // const remainingSelections = maxCards - selectedCards.length;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 처음부터 섞인 카드로 초기화
  const [shuffledCards, setShuffledCards] = useState(() => shuffleCards());
  
  // 카드 섞기 함수
  const shuffleCardsHandler = () => {
    setShuffledCards(shuffleCards());
  };
  
  useEffect(() => {
    const calculateCardPositions = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      let cardWidth = 140;
      let cardHeight = 220;
      
      if (window.innerWidth <= 1200) {
        cardWidth = 120;
        cardHeight = 190;
      }
      if (window.innerWidth <= 768) {
        cardWidth = 100;
        cardHeight = 160;
      }
      if (window.innerWidth <= 576) {
        cardWidth = 80;
        cardHeight = 130;
      }
      
      const safeMarginX = cardWidth / 2 + 20;
      const safeMarginY = cardHeight / 2 + 20;
      
      const safeAreaWidth = containerWidth - (safeMarginX * 2);
      const safeAreaHeight = containerHeight - (safeMarginY * 2);
      
      const totalCards = shuffledCards.length;
      const newPositions: {[key: number]: {x: number, y: number, rotation: number, baseZIndex: number}} = {};
      
      const rows = Math.ceil(Math.sqrt(totalCards * containerHeight / containerWidth));
      const cols = Math.ceil(totalCards / rows);
      
      shuffledCards.forEach((card, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        const baseX = safeMarginX + (col / (cols - 1 || 1)) * safeAreaWidth;
        const baseY = safeMarginY + (row / (rows - 1 || 1)) * safeAreaHeight;
        
        const randomOffsetX = (Math.random() - 0.5) * (safeAreaWidth / cols) * 0.4;
        const randomOffsetY = (Math.random() - 0.5) * (safeAreaHeight / rows) * 0.4;
        
        let x = baseX + randomOffsetX;
        let y = baseY + randomOffsetY;
        
        x = Math.max(safeMarginX, Math.min(containerWidth - safeMarginX, x));
        y = Math.max(safeMarginY, Math.min(containerHeight - safeMarginY, y));
        
        const xPercent = (x / containerWidth) * 100;
        const yPercent = (y / containerHeight) * 100;
        
        const rotation = (Math.random() - 0.5) * 40;
        
        const baseZIndex = 10 + (rows - row) * cols + col;
        
        newPositions[card.id] = { 
          x: xPercent, 
          y: yPercent, 
          rotation, 
          baseZIndex 
        };
      });
      
      setCardPositions(newPositions);
    };
    
    const timer = setTimeout(calculateCardPositions, 100);
    
    window.addEventListener('resize', calculateCardPositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateCardPositions);
    };
  }, [shuffledCards]);
  
  const getCardZIndex = (cardId: number) => {
    const position = cardPositions[cardId];
    if (!position) return 1;
    
    if (selectedCards.includes(cardId)) {
      return 1000 + selectedCards.indexOf(cardId);
    }
    
    return position.baseZIndex;
  };
  
  const isSelectionComplete = selectedCards.length === maxCards;
  
  const handleReset = () => {
    if (onResetCards) {
      onResetCards();
    }
  };
  
  // 카드 섞기 핸들러
  const handleShuffleCards = () => {
    if (selectedCards.length > 0) {
      if (onResetCards) {
        onResetCards();
      }
    }
    shuffleCardsHandler();
  };
  
  const handleViewReading = () => {
    // 선택된 카드의 번호 추출
    const selectedCardNumbers = selectedCards.map(cardId => {
      const card = shuffledCards.find(c => c.id === cardId);
      return card ? card.number : -1;
    }).filter(num => num !== -1); // 유효하지 않은 번호 제거
    
    // API 요청
    if (onRequestReading && selectedCardNumbers.length === maxCards) {
      onRequestReading(selectedCardNumbers);
    }
  };

  // 홈 버튼 클릭 효과 처리
  const handleBackButtonClick = () => {
    // 뒤로가기 버튼 클릭 시 질문 페이지로 이동
    if (onReQuestion) {
      onReQuestion();
    }
  };
  
  if (shuffledCards.length === 0) {
    return <div className="loading-container">카드를 준비하고 있습니다...</div>;
  }
  
  return (
    <div className="card-selection-container">
      {/* 홈 버튼을 뒤로가기 버튼으로 변경 */}
      <button 
        className="home-button" // 기존 CSS 클래스를 그대로 사용
        onClick={handleBackButtonClick}
        title="질문 페이지로 돌아가기"
        aria-label="질문 페이지로 돌아가기"
      >
        <FaArrowLeft className="home-icon" /> {/* 아이콘만 변경하고 클래스는 유지 */}
        <span className="home-text">뒤로</span> {/* 텍스트만 "뒤로"로 변경 */}
      </button>

      <div className="card-selection-header">
        <div className="selection-indicators">
          {Array.from({ length: maxCards }).map((_, index) => (
            <div 
              key={index} 
              className={`card-indicator ${index < selectedCards.length ? 'selected' : ''}`}
              title={`카드 ${index + 1}`}
            >
              {index < selectedCards.length ? <span>✓</span> : index + 1}
            </div>
          ))}
          
          {/* 카드 섞기 버튼 - 인디케이터와 일관된 디자인 */}
          <button 
            className="card-indicator shuffle-indicator"
            onClick={handleShuffleCards}
            disabled={isSelectionComplete}
            title="카드 섞기"
            aria-label="카드 섞기"
          >
            <FiShuffle className="shuffle-icon" />
          </button>
        </div>
        
        <h1 className="card-selection-title">타로 카드를 선택하세요</h1>
      </div>
      
      <div className="tarot-cards-container" ref={containerRef}>
        {shuffledCards.map((card) => {
          const isSelected = selectedCards.includes(card.id);
          
          return (
            <div 
              key={card.id}
              className={`tarot-card-wrapper ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${cardPositions[card.id]?.x ?? 50}%`,
                top: `${cardPositions[card.id]?.y ?? 50}%`,
                transform: `translate(-50%, -50%) rotate(${cardPositions[card.id]?.rotation ?? 0}deg)`,
                zIndex: getCardZIndex(card.id)
              }}
              data-card-id={card.id}
              data-card-number={card.number}
            >
              <TarotCard
                card={card}
                isSelected={isSelected}
                onSelect={() => onCardSelect(card.id)}
                disabled={selectedCards.length >= maxCards && !isSelected}
              />
            </div>
          );
        })}
      </div>
      
      {isSelectionComplete && (
        <div className="card-action-overlay">
          <div className="card-action-panel">
            <div className="card-action-content">
              <h2 className="card-action-title">운명의 메시지를 확인할 준비가 되었습니다</h2>
              <div className="card-action-description-container">
                <p className="card-action-description-line">
                  선택하신 3장의 카드가 당신의 질문에 대한 통찰력을 제공합니다.
                </p>
                
                {/* 질문 표시 추가
                {question && (
                  <p className="card-action-description-line question-highlight">
                    <span className="question-small-label">질문:</span> {question}
                  </p>
                )} */}
                
                <p className="card-action-description-line">
                  카드를 통해 당신만의 특별한 운명의 메시지를 읽어드립니다.
                </p>
              </div>
              <div className="card-action-buttons">
                <button 
                  className="card-action-button primary-button" 
                  onClick={handleViewReading}
                >
                  <span className="btn-text">운명의 메시지 확인하기</span>
                  <FaArrowRight className="btn-icon" />
                </button>
                <button 
                  className="card-action-button secondary-button" 
                  onClick={handleReset}
                >
                  <span className="btn-text">다시 뽑기</span>
                  <FaRedo className="btn-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSelection;
