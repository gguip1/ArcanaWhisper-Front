import { useEffect, useState } from 'react';
import '../styles/Transitions.css';

interface PageTransitionProps {
  targetPage: 'home' | 'question' | 'cardSelection' | 'result' | 'history';
  customMessage?: string;
  transitionType?: 'forward' | 'backward' | 'home' | 'newreading';
  isReturning?: boolean; // isReturning prop 추가
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  targetPage, 
  customMessage, 
  transitionType = 'forward',
  isReturning = false 
}) => {
  const [stage, setStage] = useState<'initial' | 'animate' | 'final'>('initial');
  
  // 컴포넌트가 마운트될 때 메시지를 한 번만 결정
  const [message] = useState(() => {
    // 커스텀 메시지가 있으면 우선 적용
    if (customMessage) return customMessage;
    
    // 전환 타입에 따른 메시지
    switch (transitionType) {
      case 'backward':
        return '이전 페이지로 돌아가는 중...';
      case 'home':
        return '홈 화면으로 돌아가는 중...';
      case 'newreading':
        return '새로운 타로 리딩을 준비하는 중...';
      case 'forward':
        // 기본 방향(앞으로)일 경우 목표 페이지에 따른 메시지
        switch (targetPage) {
          case 'home': 
            return '홈으로 이동하는 중...';
          case 'question':
            return '운명에 질문을 준비하는 중...';
          case 'cardSelection': 
            return '타로 카드를 펼쳐놓는 중...';
          case 'result':
            return '카드의 비밀을 해석하는 중...';
          case 'history':
            return '히스토리 페이지로 이동하는 중...';
          default: 
            return '페이지를 전환하는 중...';
        }
      default:
        // isReturning 값도 참고하여 메시지 결정
        return isReturning ? 
          '이전 페이지로 돌아가는 중...' : 
          '페이지를 전환하는 중...';
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
