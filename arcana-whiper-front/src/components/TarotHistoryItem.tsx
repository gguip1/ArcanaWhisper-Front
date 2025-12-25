import { useState, useMemo } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaClock
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { HistoryItem } from '../services/historyService';
import { shuffleCards } from '../data/tarotData';
import TarotResultCard from './TarotResultCard';

interface TarotHistoryItemProps {
  item: HistoryItem;
}

const TarotHistoryItem: React.FC<TarotHistoryItemProps> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  // 날짜 포맷팅 (한국어, KST 타임존)
  const formattedDate = useMemo(() => {
    try {
      // 서버가 UTC 시간을 타임존 정보 없이 보내는 경우 'Z' 추가
      let dateStr = item.created_at;
      if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
        dateStr += 'Z';
      }
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Seoul'
      }).format(date);
    } catch {
      return item.created_at; // 포맷팅 실패 시 원본 문자열 반환
    }
  }, [item.created_at]);
  
  // 선택한 카드 정보 가져오기 - useMemo로 최적화
  const selectedCards = useMemo(() => {
    const allCards = shuffleCards();
    return item.cards.cards.map((cardNumber, idx) => {
      const card = allCards.find(c => c.number === cardNumber);
      return card ? {
        ...card,
        reversed: item.cards.reversed ? item.cards.reversed[idx] : false
      } : undefined;
    }).filter(card => card !== undefined);
  }, [item.cards]);
  
  // 확장 토글
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`history-item ${expanded ? 'expanded' : ''}`}>
      <div className="history-item-header" onClick={toggleExpand}>
        <div className="history-item-main">
          <div className="history-item-question">{item.question}</div>
          <div className="history-item-meta">
            <span className="history-item-date">
              <FaClock className="date-icon" />
              {formattedDate}
            </span>
          </div>
        </div>
        <button
          className="expand-button"
          aria-label={expanded ? '닫기' : '펼치기'}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      {expanded && (
        <div className="history-item-details">
          <div className="history-cards">
            {selectedCards.map((card, idx) => card && (
              <div key={card.number} className="history-card-wrapper">
                <TarotResultCard
                  name={card.name}
                  number={card.number}
                  position={['첫 번째 카드', '두 번째 카드', '세 번째 카드'][idx]}
                  reversed={card.reversed}
                />
              </div>
            ))}
          </div>

          <div className="history-result">
            <ReactMarkdown>{item.result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotHistoryItem;
