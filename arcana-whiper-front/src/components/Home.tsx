import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface HomeProps {
  onStartReading: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartReading }) => {
  const { t } = useTranslation();
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  
  useEffect(() => {
    // 짧은 시간 후 애니메이션 시작 (마운트 직후)
    const timer = setTimeout(() => {
      setIsAnimationReady(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">{t('home.title')}</h1>
        <div className="home-tagline">{t('home.tagline')}</div>
        
        <div className="home-description">
          <p>
            {t('home.description')}
          </p>
        </div>
        
        <div className="button-container">
          <button className="start-button" onClick={onStartReading}>
            <span className="btn-text">{t('home.startButton')}</span>
            <span className="btn-icon">✨</span>
          </button>
        </div>
        
        <div className="disclaimer">
          <p>{t('home.disclaimer.entertainment', 'Arcana Whisper는 오락 및 자기 성찰용으로 제공됩니다.')}</p>
          <p>{t('home.disclaimer.decisions', '실제 인생 결정은 전문가 상담 및 자신의 판단을 기반으로 하길 권장합니다.')}</p>
          <p>{t('home.disclaimer.analysis', '이 앱은 사용자의 심리 상태를 분석하거나 예언하지 않습니다.')}</p>
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
