import React, { useEffect, useState, useRef } from 'react';
import TarotCard from './TarotCard';
// import { majorArcana, shuffleCards } from '../data/tarotData';
import { shuffleCards } from '../data/tarotData';
import { FaArrowRight, FaRedo, FaHome } from 'react-icons/fa';
import { FiShuffle } from 'react-icons/fi';

// props 인터페이스 업데이트
interface CardSelectionProps {
  selectedCards: number[];
  onCardSelect: (cardId: number) => void;
  maxCards: number;
  onResetCards?: () => void;
  onRequestReading?: (cardNumbers: number[]) => void; // API 요청 함수 추가
  onGoHome?: () => void; // 홈으로 돌아가는 핸들러 추가
}

const CardSelection: React.FC<CardSelectionProps> = ({ 
  selectedCards, 
  onCardSelect,
  maxCards,
  onResetCards,
  onRequestReading,
  onGoHome
}) => {
  const [cardPositions, setCardPositions] = useState<{[key: number]: {x: number, y: number, rotation: number, baseZIndex: number}}>({});
  const remainingSelections = maxCards - selectedCards.length;
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
    
    // // 콘솔에 선택된 카드 정보 출력
    // console.log('=== 선택된 카드 정보 ===');
    // selectedCardNumbers.forEach((num, i) => {
    //   const position = i === 0 ? '과거' : i === 1 ? '현재' : '미래';
    //   const card = majorArcana.find(c => c.number === num);
    //   console.log(`[${position}] ${card?.name} (${num}) - ${card?.description}`);
    // });
    
    // API 요청
    if (onRequestReading && selectedCardNumbers.length === maxCards) {
      onRequestReading(selectedCardNumbers);
    }
  };

  // 홈 버튼 클릭 효과 처리
  const handleHomeButtonClick = () => {
    const homeButton = document.querySelector('.home-button');
    if (homeButton) {
      homeButton.classList.add('clicked');
      
      // 클릭 효과 후 홈으로 이동
      if (onGoHome) {
        onGoHome();
      }
    }
  };
  
  if (shuffledCards.length === 0) {
    return <div className="loading-container">카드를 준비하고 있습니다...</div>;
  }
  
  return (
    <div className="card-selection-container">
      {/* 홈으로 돌아가는 버튼 추가 */}
      <button 
        className="home-button"
        onClick={handleHomeButtonClick}
        title="홈으로 돌아가기"
        aria-label="홈으로 돌아가기"
      >
        <FaHome className="home-icon" />
        <span className="home-text">홈</span>
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
        </div>
        
        <h1 className="card-selection-title">타로 카드를 선택하세요</h1>
        
        <p className="selection-instruction">
          {remainingSelections > 0 
            ? `${remainingSelections}장 더 선택할 수 있습니다` 
            : '선택이 완료되었습니다'}
        </p>
      </div>
      
      {/* 카드 섞기 버튼 */}
      <button 
        className="shuffle-button"
        onClick={handleShuffleCards}
        disabled={isSelectionComplete}
        title="카드 섞기"
      >
        <FiShuffle className="shuffle-icon" /> 카드 섞기
      </button>
      
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
                  선택하신 3장의 카드로 과거, 현재, 미래의 통찰력을 얻어보세요.
                </p>
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
