import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import TarotCard from './TarotCard';
import LoadingScreen from './LoadingScreen';
import { shuffleCards } from '../data/tarotData';
import { FaArrowRight, FaRedo, FaArrowLeft, FaRandom, FaCheck } from 'react-icons/fa';

// props 인터페이스 업데이트
interface CardSelectionProps {
  selectedCards: number[]; // 선택된 카드 번호 배열
  onCardSelect: (cardNumber: number) => void;
  maxCards: number;
  onResetCards?: () => void;
  onRequestReading?: () => void;
  onGoHome?: () => void;
  onReQuestion?: () => void;
  question?: string;
  isLoadingReading?: boolean;
  isReadingComplete?: boolean;
  onLoadingComplete?: () => void;
}

const CardSelection: React.FC<CardSelectionProps> = ({
  selectedCards,
  onCardSelect,
  maxCards,
  onResetCards,
  onRequestReading,
  onReQuestion,
  isLoadingReading = false,
  isReadingComplete = false,
  onLoadingComplete,
}) => {
  const [cardPositions, setCardPositions] = useState<{[key: number]: {x: number, y: number, rotation: number, baseZIndex: number}}>({});
  const containerRef = useRef<HTMLDivElement>(null);
    const [shuffledCards, setShuffledCards] = useState(() => shuffleCards());
  
  // 카드 셔플링 핸들러 - 즉시 실행 (로딩 없음)
  const shuffleCardsHandler = useCallback(() => {
    setShuffledCards(shuffleCards());
  }, []);
  
  // 카드 포지션 계산 최적화
  const calculateCardPositions = useCallback(() => {
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
      
      newPositions[card.number] = {
        x: xPercent,
        y: yPercent,
        rotation,
        baseZIndex
      };
    });
    
    setCardPositions(newPositions);
  }, [shuffledCards]);
  
  useEffect(() => {
    const timer = setTimeout(calculateCardPositions, 100);
    
    window.addEventListener('resize', calculateCardPositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateCardPositions);
    };
  }, [calculateCardPositions]);
  
  // 카드 Z-Index 계산 최적화
  const getCardZIndex = useCallback((cardNumber: number) => {
    const position = cardPositions[cardNumber];
    if (!position) return 1;

    if (selectedCards.includes(cardNumber)) {
      return 1000 + selectedCards.indexOf(cardNumber);
    }

    return position.baseZIndex;
  }, [cardPositions, selectedCards]);
  
  // 선택 완료 상태 메모화
  const isSelectionComplete = useMemo(() => 
    selectedCards.length === maxCards, 
    [selectedCards.length, maxCards]
  );
  
  // 핸들러들 최적화
  const handleReset = useCallback(() => {
    if (onResetCards) {
      onResetCards();
    }
  }, [onResetCards]);
    const handleShuffleCards = useCallback(() => {
    if (selectedCards.length > 0 && onResetCards) {
      onResetCards();
    }
    shuffleCardsHandler();
  }, [selectedCards.length, onResetCards, shuffleCardsHandler]);
  
  const handleCardClick = useCallback((cardNumber: number) => {
    onCardSelect(cardNumber);
  }, [onCardSelect]);

  const handleBackButtonClick = useCallback(() => {
    if (onReQuestion) {
      onReQuestion();
    }
  }, [onReQuestion]);
  
  // 카드가 없을 때만 기본 로딩 표시
  if (shuffledCards.length === 0) {
    return <LoadingScreen message="카드 준비 중..." />;
  }

  // API 요청 중이거나 완료 애니메이션 중일 때 타로 리딩 로딩 화면
  if (isLoadingReading || isReadingComplete) {
    return (
      <LoadingScreen
        type="reading"
        isComplete={isReadingComplete}
        onComplete={onLoadingComplete}
      />
    );
  }
  
  return (
    <div className="card-selection-container">
      {/* 별빛 배경 */}
      <div className="starfield" />

      {/* 별똥별 */}
      <div className="shooting-stars">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <button
        className="home-button"
        onClick={handleBackButtonClick}
        title="뒤로"
        aria-label="뒤로"
      >
        <FaArrowLeft className="home-icon" />
      </button>

      <div className="card-selection-header">
        <div className="selection-indicators">
          {Array.from({ length: maxCards }).map((_, index) => (
            <div
              key={index}
              className={`card-indicator ${index < selectedCards.length ? 'selected' : ''}`}
              title={`${index + 1}번째 카드`}
            >
              {index < selectedCards.length ? <FaCheck /> : index + 1}
            </div>
          ))}
          <button
            className="card-indicator shuffle-indicator"
            onClick={handleShuffleCards}
            disabled={isSelectionComplete}
            title="카드 섞기"
            aria-label="카드 섞기"
          >
            <FaRandom className="shuffle-icon" />
          </button>
        </div>

        <h1 className="card-selection-title">카드를 선택하세요</h1>
      </div>
      
      <div className="tarot-cards-container" ref={containerRef}>
        {shuffledCards.map((card) => {
          const isSelected = selectedCards.includes(card.number);

          return (
            <div
              key={card.number}
              className={`tarot-card-wrapper ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${cardPositions[card.number]?.x ?? 50}%`,
                top: `${cardPositions[card.number]?.y ?? 50}%`,
                transform: `translate(-50%, -50%) rotate(${cardPositions[card.number]?.rotation ?? 0}deg)`,
                zIndex: getCardZIndex(card.number)
              }}
              data-card-number={card.number}
            >
              <TarotCard
                card={card}
                isSelected={isSelected}
                onSelect={() => handleCardClick(card.number)}
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
              <h2 className="card-action-title">운명의 카드</h2>
              <div className="card-action-description-container">
                <p className="card-action-description-line">
                  선택된 카드가 당신의 이야기를 기다리고 있습니다
                </p>
              </div>
              <div className="card-action-buttons">
                <button
                  className={`card-action-button primary-button ${isLoadingReading ? 'loading' : ''}`}
                  onClick={onRequestReading}
                  disabled={isLoadingReading}
                >
                  {isLoadingReading ? (
                    <>
                      <div className="btn-loading-spinner"></div>
                      <span className="btn-text">리딩 중...</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-text">리딩 받기</span>
                      <FaArrowRight className="btn-icon" />
                    </>
                  )}
                </button>
                <button
                  className="card-action-button secondary-button"
                  onClick={handleReset}
                  disabled={isLoadingReading}
                >
                  <span className="btn-text">다시 선택</span>
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

