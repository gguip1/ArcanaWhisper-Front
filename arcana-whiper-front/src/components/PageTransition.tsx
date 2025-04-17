import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  targetPage: 'home' | 'cardSelection' | 'result';
  customMessage?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ targetPage, customMessage }) => {
  const [stage, setStage] = useState<'initial' | 'animate' | 'final'>('initial');
  // 컴포넌트가 마운트될 때 메시지를 한 번만 결정
  const [message] = useState(() => {
    if (customMessage) return customMessage;
    
    switch (targetPage) {
      case 'cardSelection': 
        return '타로 카드를 불러오는 중...';
      case 'result':
        return '당신의 운명을 해석하는 중...';
      default: 
        return '돌아가는 중...';
    }
  });
  
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
  
  return (
    <div className={`transition-container ${stage}`}>
      <div className="mystical-orb-loader"></div>
      <div className="transition-text">
        {message}
      </div>
    </div>
  );
};

export default PageTransition;
