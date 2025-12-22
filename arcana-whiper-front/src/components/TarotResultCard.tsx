import { useRef, useEffect, useState, useMemo } from 'react';
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
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // 폰트 사이즈를 즉시 계산하도록 useMemo 사용
  const fontSize = useMemo(() => {
    const nameLength = name.length;
    
    // 화면 너비에 따른 기본 크기 설정
    let baseSize = '1.4rem';
    if (windowWidth <= 360) {
      baseSize = '0.6rem';
    } else if (windowWidth <= 480) {
      baseSize = '0.7rem';
    } else if (windowWidth <= 600) {
      baseSize = '0.8rem';
    } else if (windowWidth <= 768) {
      baseSize = '1.0rem';
    } else if (windowWidth <= 900) {
      baseSize = '1.2rem';
    } else if (windowWidth <= 1100) {
      baseSize = '1.3rem';
    }
    
    // 이름 길이에 따른 추가 크기 조정
    if (nameLength > 15) {
      // 매우 긴 이름인 경우 더 작게
      return `calc(${baseSize} * 0.8)`;
    } else if (nameLength > 12) {
      // 긴 이름인 경우 약간 작게
      return `calc(${baseSize} * 0.9)`;
    } else {
      // 일반 길이 이름은 기본 크기 사용
      return baseSize;
    }
  }, [name, windowWidth]);

  // 윈도우 크기 변경 감지를 위한 이벤트 리스너
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 카드 번호에 따라 다양한 색상 생성
  const getCardStyle = () => {
    const hue = (number * 30) % 360;
    return {
      '--card-primary': `hsl(${hue}, 70%, 40%)`,
      '--card-secondary': `hsl(${(hue + 30) % 360}, 70%, 35%)`,
      '--card-accent': `hsl(${(hue + 180) % 360}, 80%, 70%)`,
    } as React.CSSProperties;
  };

  // 카드 번호별 심볼 선택 (이모지 대신 CSS 특수문자 사용)
  const getCardSymbol = (): string => {
    const symbols = ["*", "+", "o", "-", "x", "#", "@", "~", "=", "^"];
    return symbols[number % symbols.length];
  };

  return (
    <div className="tarot-result-container">
      <div className="tarot-position-label">
        {position}
        {reversed && <span className="reversed-indicator"> (역방향)</span>}
      </div>
      
      <div className={`tarot-result-card ${reversed ? 'reversed' : ''}`} style={getCardStyle()}>
        <div className="tarot-card-generated">
          <h2
            ref={nameRef}
            className="tarot-card-name"
            title={name}
            style={{ fontSize }}
          >
            {name}
          </h2>

          <div className="tarot-card-symbol-container">
            <div className="tarot-card-pattern"></div>
            <div className="tarot-card-glow"></div>
            <div className="tarot-card-symbol">{getCardSymbol()}</div>

            <div className="tarot-card-decoration d1"></div>
            <div className="tarot-card-decoration d2"></div>
            <div className="tarot-card-decoration d3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarotResultCard;
