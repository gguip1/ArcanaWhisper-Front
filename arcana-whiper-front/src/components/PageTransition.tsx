import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  targetPage: 'home' | 'cardSelection' | 'result';
  customMessage?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ targetPage, customMessage }) => {
  const [stage, setStage] = useState<'initial' | 'animate' | 'final'>('initial');
  
  useEffect(() => {
    // Start animation after component mounts
    const timer1 = setTimeout(() => {
      setStage('animate');
    }, 50);
    
    // Move to final stage
    const timer2 = setTimeout(() => {
      setStage('final');
    }, 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  // 상황에 맞는 메시지 결정
  const getMessage = () => {
    if (customMessage) return customMessage;
    
    switch (targetPage) {
      case 'cardSelection': 
        return '타로 카드를 불러오는 중...';
      case 'result':
        return '당신의 운명을 해석하는 중...';
      default: 
        return '돌아가는 중...';
    }
  };
  
  return (
    <div className={`transition-container ${stage}`}>
      <div className="mystical-orb-loader"></div>
      <div className="transition-text">
        {getMessage()}
      </div>
    </div>
  );
};

export default PageTransition;
