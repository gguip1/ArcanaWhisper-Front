import { useState, useEffect } from 'react';
import { useSEO } from '../hooks';

interface HomeProps {
  onStartReading: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartReading }) => {
  const [isAnimationReady, setIsAnimationReady] = useState(false);

  // SEO 설정
  useSEO({
    title: 'ArcanaWhisper - AI 타로 리딩으로 보는 운명의 메시지',
    description: 'AI 타로 리딩으로 당신의 운명을 알아보세요. 타로 카드와 인공지능이 속삭이는 운명의 메시지를 지금 확인하세요.',
    canonical: 'https://aitarot.site'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationReady(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">ArcanaWhisper</h1>
        <div className="home-tagline">타로 카드와 LLM이 속삭이는 운명의 메시지</div>

        <div className="home-description">
          <p>
            Arcana Whisper는 인공지능을 통해 타로 카드 리딩을 경험할 수 있는 타로 서비스입니다.
            신비로운 타로의 세계와 인공지능의 힘이 만나, 지금 이 순간 당신에게 필요한 메시지를 전해드립니다.
          </p>
        </div>

        <div className="button-container">
          <button className="start-button" onClick={onStartReading}>
            <span className="btn-text">운명의 메시지 시작하기</span>
          </button>
        </div>

        <div className="disclaimer">
          <p>Arcana Whisper는 오락 및 자기 성찰용으로 제공됩니다.</p>
          <p>실제 인생 결정은 전문가 상담 및 자신의 판단을 기반으로 하길 권장합니다.</p>
          <p>이 앱은 사용자의 심리 상태를 분석하거나 예언하지 않습니다.</p>
        </div>
      </div>

      <div className={`home-decoration ${isAnimationReady ? 'animated' : ''}`}>
        <div className="floating-card card-1"></div>
        <div className="floating-card card-2"></div>
        <div className="floating-card card-3"></div>
        <div className="mystical-orb"></div>
      </div>
    </div>
  );
};

export default Home;
