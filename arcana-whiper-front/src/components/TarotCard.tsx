import React from 'react';
import { TarotCard as TarotCardType, cardBackImage } from '../data/tarotData';

interface TarotCardProps {
  card: TarotCardType;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const TarotCard: React.FC<TarotCardProps> = ({ card, isSelected, onSelect, disabled = false }) => {
  return (
    <div 
      className={`tarot-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onSelect}
    >
      <div className="tarot-card-inner">
        <div className="tarot-card-front">
          {cardBackImage ? (
            <img 
              src={cardBackImage} 
              alt="카드 뒷면" 
              className="tarot-card-back-image"
            />
          ) : (
            <div className="tarot-card-back-gradient">
              <span className="tarot-card-back-symbol">✦</span>
            </div>
          )}
        </div>
        <div className="tarot-card-back">
          {card.image ? (
            <img 
              className="tarot-card-image" 
              src={card.image} 
              alt={card.name} 
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
};

export default TarotCard;
