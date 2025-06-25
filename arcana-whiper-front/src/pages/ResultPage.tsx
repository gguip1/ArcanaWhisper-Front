import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReadingResult from '../components/ReadingResult';
import { useTarot } from '../contexts/TarotContext';

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    state: { readingResult, question, selectedCards }, 
    resetState
  } = useTarot();

  const handleNewReading = () => {
    resetState();
    navigate('/question');
  };

  const handleGoHome = () => {
    resetState();
    navigate('/');
  };

  // 결과가 없으면 홈으로 리다이렉트
  if (!readingResult) {
    navigate('/');
    return null;
  }

  return (
    <ReadingResult
      markdown={readingResult}
      onNewReading={handleNewReading}
      onGoHome={handleGoHome}
      question={question}
      selectedCardInfos={selectedCards}
    />
  );
};

export default ResultPage;
