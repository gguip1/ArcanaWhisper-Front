import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { FaHome, FaMagic } from 'react-icons/fa';
import { shuffleCards } from '../data/tarotData';
import TarotResultCard from './TarotResultCard';
import { useSEO } from '../hooks';

// 카드 정보 타입 정의 (App.tsx와 일치해야 함)
interface SelectedCardInfo {
  id: number;
  number: number;
  reversed: boolean;
}

interface ReadingResultProps {
  markdown: string;
  onNewReading: () => void;
  onGoHome: () => void;
  question?: string;
  selectedCardInfos?: SelectedCardInfo[]; // 방향 정보를 포함한 카드 정보
}

const ReadingResult: React.FC<ReadingResultProps> = ({ 
  markdown, 
  onNewReading,
  onGoHome,
  question = '',
  selectedCardInfos = []
}) => {
  const { t, i18n } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);

  // SEO 설정 - 질문과 결과를 포함한 동적 메타데이터
  const truncatedQuestion = question.length > 50 ? question.substring(0, 50) + '...' : question;
  useSEO({
    title: i18n.language === 'ko' 
      ? `타로 리딩 결과 - ${truncatedQuestion} | ArcanaWhisper`
      : `Tarot Reading Result - ${truncatedQuestion} | ArcanaWhisper`,
    description: i18n.language === 'ko'
      ? `"${truncatedQuestion}"에 대한 AI 타로 리딩 결과를 확인하세요. 선택한 카드들이 전하는 운명의 메시지입니다.`
      : `Check your AI Tarot Reading result for "${truncatedQuestion}". Discover the destiny message from your selected cards.`
  });

  // 페이지 로드시 효과 적용
  useEffect(() => {
    // 페이지 최상단으로 스크롤
    window.scrollTo(0, 0);
    
    // 첫 번째 단락에 스타일 적용
    if (contentRef.current) {
      const firstParagraph = contentRef.current.querySelector('p');
      if (firstParagraph) {
        firstParagraph.classList.add('first-paragraph');
      }
    }
  }, []);

  // 홈 버튼 클릭 효과 처리
  const handleHomeButtonClick = () => {
    onGoHome();
  };

  // 카드 포지션 정의
  const positions = [
    t('result.positions.first'),
    t('result.positions.second'),
    t('result.positions.third')
  ];
  
  // 전체 카드 데이터 가져오기
  const allCards = shuffleCards();
  
  // 선택한 카드 정보 가져오기
  const selectedCards = selectedCardInfos.map(cardInfo => {
    const card = allCards.find(c => c.id === cardInfo.id);
    return card ? { ...card, reversed: cardInfo.reversed } : undefined;
  }).filter(card => card !== undefined); // undefined 필터링

  return (
    <div className="reading-result-container">
      {/* 홈으로 돌아가는 버튼 */}
      <button 
        className="home-button"
        onClick={handleHomeButtonClick}
        title={t('result.homeButton')}
        aria-label={t('result.homeButton')}
      >
        <FaHome className="home-icon" />
        <span className="home-text">{t('result.homeButton')}</span>
      </button>

      <div className="reading-header">
        <h1 className="reading-title">{t('result.title')}</h1>
      </div>
      
      {/* 질문 영역 */}
      {question && (
        <div className="content-card question-section fade-in">
          <h2 className="section-title">{t('result.question')}</h2>
          <div className="reading-question">
            <div className="question-text">{question}</div>
          </div>
        </div>
      )}
      
      {/* 영역 연결 요소 */}
      <div className="section-connector"></div>
      
      {/* 카드 영역 - 테두리 제거 */}
      <div className="content-card card-section fade-in" style={{animationDelay: '0.2s'}}>
        <h2 className="section-title">{t('result.selectedCards')}</h2>
        <div className="cards-container">
          {selectedCards.length > 0 && (
            <div className="selected-tarot-cards">
              {selectedCards.map((card, index) => card && (
                <TarotResultCard
                  key={card.id}
                  name={card.name}
                  number={card.number}
                  description={card.description}
                  image={card.image}
                  position={positions[index % positions.length]}
                  reversed={card.reversed} // 역방향 정보 전달
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 영역 연결 요소 */}
      <div className="section-connector"></div>
      
      {/* 결과 영역 - 이중 테두리 제거 */}
      <div className="content-card result-section fade-in" style={{animationDelay: '0.4s'}}>
        <h2 className="section-title">{t('result.title')}</h2>
        <div className="reading-content" ref={contentRef}>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
      
      <div className="reading-actions fade-in" style={{animationDelay: '0.5s'}}>
        <button 
          className="reading-action-btn primary-action" 
          onClick={onNewReading}
          aria-label={t('result.newReadingButton')}
        >
          <FaMagic /> <span className="btn-text">{t('result.newReadingButton')}</span>
        </button>
      </div>
    </div>
  );
};

export default ReadingResult;
