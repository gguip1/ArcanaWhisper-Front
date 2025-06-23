import React, { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import TarotCard from './TarotCard';
import { shuffleCards, TarotCard as TarotCardType } from '../data/tarotData';
import { FaArrowRight, FaRedo, FaArrowLeft } from 'react-icons/fa';
import { FiShuffle } from 'react-icons/fi';

interface CardSelectionOptimizedProps {
  selectedCards: number[];
  onCardSelect: (cardId: number, cardNumber: number) => void;
  maxCards: number;
  onResetCards?: () => void;
  onRequestReading?: () => void;
  onGoHome?: () => void;
  onReQuestion?: () => void;
  question?: string;
}

// 카드 위치 타입 정의
interface CardPosition {
  x: number;
  y: number;
  rotation: number;
  baseZIndex: number;
}

// 카드 위치 계산 로직을 별도 함수로 분리 (메모이제이션 가능)
const calculateCardPositions = (
  containerWidth: number,
  containerHeight: number,
  cards: TarotCardType[]
): Record<number, CardPosition> => {
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
    const totalCards = cards.length;
  const newPositions: Record<number, CardPosition> = {};
  
  const rows = Math.ceil(Math.sqrt(totalCards * containerHeight / containerWidth));
  const cols = Math.ceil(totalCards / rows);
  
  cards.forEach((card, index) => {
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
  
  return newPositions;
};

const CardSelectionOptimized: React.FC<CardSelectionOptimizedProps> = memo(({ 
  selectedCards, 
  onCardSelect,
  maxCards,
  onResetCards,
  onRequestReading,
  onReQuestion,
}) => {
  const [cardPositions, setCardPositions] = useState<Record<number, CardPosition>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [shuffledCards, setShuffledCards] = useState(() => shuffleCards());

  // 메모이제이션된 계산값들
  const isSelectionComplete = useMemo(() => {
    return selectedCards.length === maxCards;
  }, [selectedCards.length, maxCards]);

  // 카드 Z-index 계산 함수 메모이제이션
  const getCardZIndex = useCallback((cardId: number) => {
    const position = cardPositions[cardId];
    if (!position) return 1;
    
    if (selectedCards.includes(cardId)) {
      return 1000 + selectedCards.indexOf(cardId);
    }
    
    return position.baseZIndex;
  }, [cardPositions, selectedCards]);

  // 이벤트 핸들러들 메모이제이션
  const handleCardClick = useCallback((cardId: number, cardNumber: number) => {
    onCardSelect(cardId, cardNumber);
  }, [onCardSelect]);

  const handleReset = useCallback(() => {
    onResetCards?.();
  }, [onResetCards]);

  const handleShuffleCards = useCallback(() => {
    if (selectedCards.length > 0) {
      onResetCards?.();
    }
    setShuffledCards(shuffleCards());
  }, [selectedCards.length, onResetCards]);

  const handleBackButtonClick = useCallback(() => {
    onReQuestion?.();
  }, [onReQuestion]);

  // 카드 위치 계산 효과
  useEffect(() => {
    const updateCardPositions = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const positions = calculateCardPositions(containerWidth, containerHeight, shuffledCards);
      setCardPositions(positions);
    };

    updateCardPositions();
    
    const handleResize = () => {
      setTimeout(updateCardPositions, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shuffledCards]);

  // 로딩 상태
  if (shuffledCards.length === 0) {
    return <div className="loading-container">카드를 준비하고 있습니다...</div>;
  }

  return (
    <div className="card-selection-container">
      <button 
        className="home-button"
        onClick={handleBackButtonClick}
        title="질문 페이지로 돌아가기"
        aria-label="질문 페이지로 돌아가기"
      >
        <FaArrowLeft className="home-icon" />
        <span className="home-text">뒤로</span>
      </button>

      <div className="card-selection-header">
        <div className="selection-indicators">
          {Array.from({ length: maxCards }, (_, index) => (
            <div 
              key={index} 
              className={`card-indicator ${index < selectedCards.length ? 'selected' : ''}`}
              title={`카드 ${index + 1}`}
            >
              {index < selectedCards.length ? <span>✓</span> : index + 1}
            </div>
          ))}
          
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
          const position = cardPositions[card.id];
          
          return (
            <div 
              key={card.id}
              className={`tarot-card-wrapper ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${position?.x ?? 50}%`,
                top: `${position?.y ?? 50}%`,
                transform: `translate(-50%, -50%) rotate(${position?.rotation ?? 0}deg)`,
                zIndex: getCardZIndex(card.id)
              }}
              data-card-id={card.id}
              data-card-number={card.number}
            >
              <TarotCard
                card={card}
                isSelected={isSelected}
                onSelect={handleCardClick}
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
                <p className="card-action-description-line">
                  카드를 통해 당신만의 특별한 운명의 메시지를 읽어드립니다.
                </p>
              </div>
              <div className="card-action-buttons">
                <button 
                  className="card-action-button primary-button" 
                  onClick={onRequestReading}
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
});

// displayName 설정
CardSelectionOptimized.displayName = 'CardSelectionOptimized';

export default CardSelectionOptimized;
