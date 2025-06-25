import React from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../components/Home';
import { useTarot } from '../contexts/TarotContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { resetState } = useTarot();

  const handleStartReading = () => {
    // 새로운 리딩 시작 시 이전 상태 초기화
    resetState();
    navigate('/question');
  };

  return <Home onStartReading={handleStartReading} />;
};

export default HomePage;
