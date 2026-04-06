import { useState } from 'react';
import '../styles/TarotResultCard.css';

interface TarotResultCardProps {
  name: string;
  number: number;
  position: string;
  reversed?: boolean;
}

const TarotResultCard: React.FC<TarotResultCardProps> = ({
  name,
  number,
  position,
  reversed = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // 카드 번호 → 이미지 파일 매핑 (number 1 = 0.jpg)
  const imageNumber = number - 1;
  const imagePath = `/assets/tarot-cards/${imageNumber}.jpg`;

  return (
    <div className="tarot-result-container">
      <div className="tarot-position-label">
        {position}
        {reversed && <span className="reversed-indicator"> (역방향)</span>}
      </div>

      <div className={`tarot-result-card ${reversed ? 'reversed' : ''}`}>
        <div className="tarot-card-image-wrapper">
          {!imageLoaded && <div className="tarot-card-placeholder" />}
          <img
            src={imagePath}
            alt={name}
            className={`tarot-card-image ${imageLoaded ? 'loaded' : 'loading'}`}
            loading="eager"
            onLoad={() => setImageLoaded(true)}
          />
          <div className="tarot-card-name-overlay">{name}</div>
        </div>
      </div>
    </div>
  );
};

export default TarotResultCard;
