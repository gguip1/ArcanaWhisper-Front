import { useState, useEffect } from 'react';
import '../styles/LoadingScreen.css';

interface LoadingScreenProps {
  type?: 'default' | 'reading';
  message?: string;
  isComplete?: boolean;
  onComplete?: () => void;
}

// 타로 리딩 시 시간별 표시 메시지
const READING_MESSAGES = [
  { time: 0, message: '카드를 펼치고 있습니다...' },
  { time: 3000, message: '별자리의 기운을 읽고 있습니다...' },
  { time: 6000, message: '카드의 의미를 해석하고 있습니다...' },
  { time: 10000, message: '운명의 실타래를 풀어가고 있습니다...' },
  { time: 15000, message: '깊은 통찰을 얻고 있습니다...' },
  { time: 20000, message: '거의 완료되었습니다...' },
  { time: 25000, message: '조금만 더 기다려주세요...' },
];

const LoadingScreen = ({ type = 'default', message, isComplete = false, onComplete }: LoadingScreenProps) => {
  const [currentMessage, setCurrentMessage] = useState(
    message || (type === 'reading' ? READING_MESSAGES[0].message : '로딩 중...')
  );
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // 시간 기반 진행 (0-95%)
  useEffect(() => {
    if (type !== 'reading' || isComplete) return;

    const startTime = Date.now();
    const maxTime = 30000; // 30초

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // 프로그레스 업데이트 (30초 기준, 최대 95%)
      const newProgress = Math.min((elapsed / maxTime) * 100, 95);
      setProgress(newProgress);

      // 시간에 따른 메시지 변경
      const matchingMessage = [...READING_MESSAGES]
        .reverse()
        .find(m => elapsed >= m.time);

      if (matchingMessage) {
        setCurrentMessage(matchingMessage.message);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [type, isComplete]);

  // API 완료 시 빠르게 100%로 채우기
  useEffect(() => {
    if (!isComplete || isFinishing) return;

    setIsFinishing(true);
    setCurrentMessage('완료되었습니다!');

    // 현재 progress에서 100%까지 빠르게 채움
    const finishAnimation = () => {
      let currentProgress = progress;
      const step = (100 - currentProgress) / 10; // 10단계로 나눠서 채움

      const animate = setInterval(() => {
        currentProgress += step;
        if (currentProgress >= 100) {
          setProgress(100);
          clearInterval(animate);
          // 100% 도달 후 약간의 딜레이
          setTimeout(() => {
            onComplete?.();
          }, 300);
        } else {
          setProgress(currentProgress);
        }
      }, 50);
    };

    finishAnimation();
  }, [isComplete, isFinishing, progress, onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <div className="loading-glow"></div>
        </div>

        <p className="loading-message">{currentMessage}</p>

        {type === 'reading' && (
          <div className="loading-progress-container">
            <div className="loading-progress-bar">
              <div
                className="loading-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
