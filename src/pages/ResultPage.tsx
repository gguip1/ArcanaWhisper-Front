import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReadingResult from '../components/ReadingResult';
import { useTarot } from '../contexts/TarotContext';

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state: { readingResult, question, selectedCards, historyId },
    resetState
  } = useTarot();

  // 결과가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!readingResult) {
      navigate('/');
    }
  }, [readingResult, navigate]);

  const handleNewReading = () => {
    resetState();
    navigate('/question');
  };

  const handleGoHome = () => {
    resetState();
    navigate('/');
  };

  if (!readingResult) {
    return null;
  }

  return (
    <ReadingResult
      markdown={readingResult}
      onNewReading={handleNewReading}
      onGoHome={handleGoHome}
      question={question}
      selectedCardInfos={selectedCards}
      historyId={historyId}
    />
  );
};

export default ResultPage;
