import React, { useState } from 'react';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaClock, 
  // FaCardsHeart, 
  FaMagic
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { HistoryItem, HistoryService } from '../services/historyService';
import { shuffleCards } from '../data/tarotData';
import TarotResultCard from './TarotResultCard';

interface TarotHistoryItemProps {
  item: HistoryItem;
  index: number;
}

const TarotHistoryItem: React.FC<TarotHistoryItemProps> = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  // 날짜 포맷팅 - 정적 메서드 직접 호출
  const formattedDate = HistoryService.formatDate(item.created_at);
  
  // 선택한 카드 정보 가져오기
  const allCards = shuffleCards();
  const selectedCards = item.cards
    .map(cardNumber => allCards.find(card => card.number === cardNumber))
    .filter(card => card !== undefined);
  
  // 결과 텍스트 요약 (접힌 상태에서 표시)
  const previewText = item.result.length > 180
    ? `${item.result.substring(0, 180)}...`
    : item.result;
  
  // 확장 토글
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`history-item ${expanded ? 'expanded' : ''}`}>
      <div className="history-item-header" onClick={toggleExpand}>
        <div className="history-item-number">{index}</div>
        <div className="history-item-summary">
          <div className="history-item-question">{item.question}</div>
          <div className="history-item-date">
            <FaClock className="history-item-date-icon" />
            {formattedDate}
          </div>
        </div>
        <button 
          className="expand-button" 
          aria-label={expanded ? '접기' : '펼치기'}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      {!expanded ? (
        <div className="history-item-preview">
          <div className="preview-label">
            {/* <FaMagic /> 선택한 카드 */}
          </div>
          <div className="preview-cards">
            {selectedCards.map((card, idx) => card && (
              <div key={idx} className="preview-card">
                {card.name}
              </div>
            ))}
          </div>
          <div className="preview-result">{previewText}</div>
        </div>
      ) : (
        <div className="history-item-details">
          <div className="history-cards">
            {selectedCards.map((card, idx) => card && (
              <div key={idx} className="history-card-wrapper">
                <TarotResultCard
                  name={card.name}
                  number={card.number}
                  description={card.description || ''}
                  image={card.image}
                  position={['첫번째', '두번째', '세번째'][idx]}
                />
              </div>
            ))}
          </div>
          
          <div className="history-result">
            <h3 className="result-title">
              <FaMagic className="result-title-icon" />
              카드 해석 결과
            </h3>
            <div className="result-content">
              <ReactMarkdown>{item.result}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotHistoryItem;
