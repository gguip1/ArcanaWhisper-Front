import React, { useCallback, memo } from 'react';
import { TarotCard as TarotCardType } from '../data/tarotData';

interface TarotCardProps {
  card: TarotCardType;
  isSelected: boolean;
  onSelect: (cardId: number, cardNumber: number) => void;
  disabled?: boolean;
}

const TarotCard: React.FC<TarotCardProps> = memo(({ card, isSelected, onSelect, disabled }) => {
  // 클릭 핸들러 메모이제이션
  const handleClick = useCallback(() => {
    if (!disabled || isSelected) {
      onSelect(card.id, card.number);
    }
  }, [card.id, card.number, onSelect, disabled, isSelected]);

  // 키보드 접근성을 위한 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div 
      className={`tarot-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled && !isSelected ? -1 : 0}
      aria-label={`타로 카드 ${card.name} ${isSelected ? '선택됨' : '선택하기'}`}
      aria-pressed={isSelected}
    >
      <div className="tarot-card-inner">
        {/* 카드 뒷면 개선 */}
        <div className="tarot-card-front">
          <div className="tarot-card-back-gradient">
            {/* <div className="tarot-card-back-pattern"></div> */}
            <div className="tarot-card-back-border"></div>
            <div className="tarot-card-back-symbol">✦</div>
          </div>
        </div>
        
        <div className="tarot-card-back">
          {card.image ? (
            <img 
              className="tarot-card-image" 
              src={card.image} 
              alt={card.name}
              loading="lazy" // 이미지 레이지 로딩
              decoding="async" // 비동기 디코딩
            />
          ) : (
            <div className="tarot-card-placeholder">
              <h3>{card.name}</h3>
              <div className="tarot-card-number">{card.number}</div>
            </div>
          )}
          <div className="tarot-card-name">{card.name}</div>
        </div>
      </div>
    </div>
  );
});

// displayName 설정 (개발자 도구에서 디버깅 용이)
TarotCard.displayName = 'TarotCard';

export default TarotCard;
