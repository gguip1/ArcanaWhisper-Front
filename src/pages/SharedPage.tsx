import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { FaMagic } from 'react-icons/fa';
import { majorArcana } from '../data/tarotData';
import TarotResultCard from '../components/TarotResultCard';
import LoadingScreen from '../components/LoadingScreen';
import { getSharedReading } from '../services/shareService';
import { SharedReading } from '../types';
import { useSEO } from '../hooks';
import '../styles/ReadingResult.css';
import '../styles/SharedPage.css';

const SharedPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [reading, setReading] = useState<SharedReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // SEO 설정
  useSEO({
    title: 'ArcanaWhisper - 타로 리딩 결과',
    description: 'AI 타로 리딩 결과를 확인해보세요. 신비로운 타로 카드가 전하는 메시지입니다.'
  });

  useEffect(() => {
    // Strict Mode에서 중복 실행 방지
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchReading = async () => {
      if (!shareId) {
        setError('잘못된 접근입니다.');
        setLoading(false);
        return;
      }

      try {
        const data = await getSharedReading(shareId);
        setReading(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '리딩 결과를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReading();
  }, [shareId]);

  const handleTryTarot = () => {
    navigate('/?utm_source=share');
  };

  // 카드 정보 가져오기 (reading이 있을 때만)
  const positions = ['첫 번째 카드', '두 번째 카드', '세 번째 카드'];
  const selectedCards = reading?.cards.cards.map((cardNumber, index) => {
    const card = majorArcana.find(c => c.number === cardNumber);
    return card ? { ...card, reversed: reading.cards.reversed[index] } : undefined;
  }).filter(card => card !== undefined) || [];

  // 로딩 중
  if (loading) {
    return <LoadingScreen message="리딩 결과를 불러오는 중..." />;
  }

  // 에러 또는 만료
  if (error || !reading) {
    return (
      <div className="reading-result-container shared-page-container">
        <div className="starfield"></div>
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
        <div className="shared-header-logo">ArcanaWhisper</div>
        <div className="shared-error-content">
          <div className="shared-error-icon">
            <FaMagic />
          </div>
          <h1 className="shared-error-title">리딩 결과를 찾을 수 없어요</h1>
          <p className="shared-error-message">
            {error || '만료되었거나 존재하지 않는 링크입니다.'}
          </p>
          <button
            className="shared-cta-button"
            onClick={handleTryTarot}
          >
            <FaMagic /> <span>새로운 타로 보러 가기</span>
          </button>
        </div>
      </div>
    );
  }

  // 성공 - 콘텐츠 표시
  return (
    <div className="reading-result-container shared-page-container">
      <div className="starfield"></div>
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
      <div className="shared-header-logo">ArcanaWhisper</div>
      <div className="reading-header">
        <h1 className="reading-title">타로 리딩 결과</h1>
      </div>

      {/* 질문 영역 */}
      {reading.question && (
        <div className="content-card question-section fade-in">
          <h2 className="section-title">질문</h2>
          <div className="reading-question">
            <div className="question-text">{reading.question}</div>
          </div>
        </div>
      )}

      {/* 영역 연결 요소 */}
      <div className="section-connector"></div>

      {/* 카드 영역 */}
      <div className="content-card card-section fade-in">
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

      {/* 결과 영역 */}
      <div className="content-card result-section fade-in">
        <h2 className="section-title">리딩 결과</h2>
        <div className="reading-content">
          <ReactMarkdown>{reading.result}</ReactMarkdown>
        </div>
      </div>

      {/* CTA 영역 */}
      <div className="shared-cta-section fade-in">
        <p className="shared-cta-text">나도 타로 리딩을 받아보고 싶다면?</p>
        <button
          className="shared-cta-button"
          onClick={handleTryTarot}
        >
          <FaMagic /> <span>나도 타로 보러 가기</span>
        </button>
      </div>

      {/* 푸터 */}
      <div className="shared-footer fade-in">
        <span className="shared-footer-brand">ArcanaWhisper</span>
        <span className="shared-footer-divider">|</span>
        <span className="shared-footer-tagline">AI 타로 리딩 서비스</span>
      </div>
    </div>
  );
};

export default SharedPage;
