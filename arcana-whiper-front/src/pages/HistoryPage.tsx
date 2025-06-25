import React from 'react';
import { useNavigate } from 'react-router-dom';
import TarotHistory from '../components/TarotHistory';
import { useTarot } from '../contexts/TarotContext';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetState } = useTarot();

  const handleGoHome = () => {
    resetState();
    navigate('/');
  };

  return <TarotHistory onGoHome={handleGoHome} />;
};

export default HistoryPage;
