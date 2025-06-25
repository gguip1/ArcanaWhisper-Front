import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaClock, 
  FaMagic
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { HistoryItem } from '../services/historyService';
import { shuffleCards } from '../data/tarotData';
import TarotResultCard from './TarotResultCard';

interface TarotHistoryItemProps {
  item: HistoryItem;
  index: number;
}

const TarotHistoryItem: React.FC<TarotHistoryItemProps> = ({ item, index }) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  // 날짜 포맷팅 - 현재 언어에 따라 동적으로 포맷
  const formattedDate = useMemo(() => {
    try {
      const date = new Date(item.created_at);
      const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return item.created_at; // 포맷팅 실패 시 원본 문자열 반환
    }
  }, [item.created_at, i18n.language]);
  
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
          aria-label={expanded ? t('common.close') : t('common.expand')}
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
                {card.reversed && <span className="reversed-tag"> ({t('history.reversed')})</span>}
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
                  key={`${card.number}-${expanded}`} // key에 expanded 상태 추가하여 재렌더링 방지
                  name={card.name}
                  number={card.number}
                  description={card.description || ''}
                  image={card.image}
                  position={[t('result.positions.first'), t('result.positions.second'), t('result.positions.third')][idx]}
                  reversed={card.reversed} // 역방향 정보 전달
                />
              </div>
            ))}
          </div>
          
          <div className="history-result">
            <h3 className="result-title">
              <FaMagic className="result-title-icon" />
              {t('result.title')}
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
