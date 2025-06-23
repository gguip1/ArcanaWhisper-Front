import React from 'react';
import ReadingResult from '../components/ReadingResult';

const ResultPage: React.FC = () => {
  return (
    <ReadingResult
      markdown=""
      onNewReading={() => {}}
      onGoHome={() => {}}
      question=""
      selectedCardInfos={[]}
    />
  );
};

export default ResultPage;
