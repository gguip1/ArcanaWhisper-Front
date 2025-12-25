import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaHome, FaMagic } from 'react-icons/fa';
import { majorArcana } from '../data/tarotData';
import TarotResultCard from './TarotResultCard';
import { useSEO } from '../hooks';
import '../styles/ReadingResult.css';

// 카드 정보 타입 정의
interface SelectedCardInfo {
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
  const contentRef = useRef<HTMLDivElement>(null);

  // SEO 설정 - 질문과 결과를 포함한 동적 메타데이터
  const truncatedQuestion = question.length > 50 ? question.substring(0, 50) + '...' : question;
  useSEO({
    title: `타로 리딩 결과 - ${truncatedQuestion} | ArcanaWhisper`,
    description: `"${truncatedQuestion}"에 대한 AI 타로 리딩 결과를 확인하세요. 선택한 카드들이 전하는 운명의 메시지입니다.`
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
  const positions = ['첫 번째 카드', '두 번째 카드', '세 번째 카드'];

  // 선택한 카드 정보 가져오기
  const selectedCards = selectedCardInfos.map(cardInfo => {
    const card = majorArcana.find(c => c.number === cardInfo.number);
    return card ? { ...card, reversed: cardInfo.reversed } : undefined;
  }).filter(card => card !== undefined);

  return (
    <div className="reading-result-container">
      {/* 별빛 배경 */}
      <div className="starfield"></div>

      {/* 별똥별 효과 */}
      <div className="shooting-stars">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* 홈으로 돌아가는 버튼 - 원형 아이콘만 */}
      <button
        className="home-button"
        onClick={handleHomeButtonClick}
        title="홈으로"
        aria-label="홈으로"
      >
        <FaHome className="home-icon" />
      </button>

      <div className="reading-header">
        <h1 className="reading-title">리딩 결과</h1>
      </div>

      {/* 질문 영역 */}
      {question && (
        <div className="content-card question-section fade-in">
          <h2 className="section-title">질문</h2>
          <div className="reading-question">
            <div className="question-text">{question}</div>
          </div>
        </div>
      )}
      
      {/* 영역 연결 요소 */}
      <div className="section-connector"></div>
      
      {/* 카드 영역 - 테두리 제거 */}
      <div className="content-card card-section fade-in" style={{animationDelay: '0.2s'}}>
        <h2 className="section-title">선택한 카드</h2>
        <div className="cards-container">
          {selectedCards.length > 0 && (
            <div className="selected-tarot-cards">
              {selectedCards.map((card, index) => card && (
                <TarotResultCard
                  key={card.number}
                  name={card.name}
                  number={card.number}
                  position={positions[index % positions.length]}
                  reversed={card.reversed}
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
        <h2 className="section-title">리딩 결과</h2>
        <div className="reading-content" ref={contentRef}>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
      
      <div className="reading-actions fade-in" style={{animationDelay: '0.5s'}}>
        <button
          className="reading-action-btn primary-action"
          onClick={onNewReading}
          aria-label="새로운 리딩"
        >
          <FaMagic /> <span className="btn-text">새로운 리딩</span>
        </button>
      </div>
    </div>
  );
};

export default ReadingResult;
