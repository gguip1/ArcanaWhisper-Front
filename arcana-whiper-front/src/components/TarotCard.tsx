import { TarotCard as TarotCardType } from '../data/tarotData';

interface TarotCardProps {
  card: TarotCardType;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const TarotCard: React.FC<TarotCardProps> = ({ card, isSelected, onSelect, disabled }) => {
  return (
    <div
      className={`tarot-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={!disabled || isSelected ? onSelect : undefined}
    >
      <div className="tarot-card-inner">
        {/* 카드 뒷면 */}
        <div className="tarot-card-front">
          <div className="tarot-card-back-gradient">
            <div className="tarot-card-back-border"></div>
            <div className="tarot-card-back-symbol">✦</div>
          </div>
        </div>

        {/* 카드 앞면 */}
        <div className="tarot-card-back">
          <div className="tarot-card-placeholder">
            <h3>{card.name}</h3>
            <div className="tarot-card-number">{card.number}</div>
          </div>
          <div className="tarot-card-name">{card.name}</div>
        </div>
      </div>
    </div>
  );
};

export default TarotCard;
