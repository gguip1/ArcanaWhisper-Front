import { useNavigate } from 'react-router-dom';
import CardSelection from '../components/CardSelection';
import { useTarot } from '../contexts/TarotContext';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { requestTarotReading } from '../services/tarotService';
import authService from '../services/authService';
import errorService from '../services/errorService';
import { MAX_CARDS } from '../constants';

const CardSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    state: { selectedCards, question }, 
    setSelectedCards, 
    setReadingResult,
    resetState 
  } = useTarot();

  const {
    loading: isLoading,
    execute: executeReading,
  } = useAsyncOperation<string>();

  const handleCardSelect = (cardNumber: number) => {
    const cardIndex = selectedCards.findIndex(card => card.number === cardNumber);

    if (cardIndex !== -1) {
      // 카드가 이미 선택되어 있으면 제거
      const newCards = selectedCards.filter(card => card.number !== cardNumber);
      setSelectedCards(newCards);
    } else {
      // 새 카드 추가 (최대 3장까지)
      if (selectedCards.length < MAX_CARDS) {
        const newCard = {
          number: cardNumber,
          reversed: Math.random() < 0.5 // 50% 확률로 역방향
        };
        setSelectedCards([...selectedCards, newCard]);
      }
    }
  };

  const handleResetCards = () => {
    setSelectedCards([]);
  };

  const handleRequestReading = async () => {
    if (selectedCards.length !== MAX_CARDS) {
      errorService.showError('정확히 3장의 카드를 선택해주세요.');
      return;
    }

    try {
      const result = await executeReading(async () => {
        // 로그인 상태 확인
        const currentUser = authService.currentUser;
        
        // API 요청 데이터 구성
        const requestData = {
          cards: {
            cards: selectedCards.map(card => card.number),
            reversed: selectedCards.map(card => card.reversed)
          },
          question: question,
          // 로그인 상태일 때만 user_id, provider 추가
          ...(currentUser && {
            user_id: currentUser.uid,
            provider: currentUser.provider
          })
        };
        
        const response = await requestTarotReading(requestData);
        return response.result;
      });
      
      setReadingResult(result);
      navigate('/result');
      
    } catch (error) {
      console.error('타로 해석 요청 실패:', error);
      
      if (error instanceof Error) {
        errorService.showError(error.message);
      } else {
        errorService.showError('알 수 없는 오류가 발생했습니다');
      }
    }
  };

  const handleGoHome = () => {
    resetState();
    navigate('/');
  };

  const handleReQuestion = () => {
    setSelectedCards([]);
    navigate('/question');
  };

  return (
    <CardSelection
      selectedCards={selectedCards.map(card => card.number)}
      onCardSelect={handleCardSelect}
      maxCards={MAX_CARDS}
      onResetCards={handleResetCards}
      onRequestReading={handleRequestReading}
      onGoHome={handleGoHome}
      onReQuestion={handleReQuestion}
      question={question}
      isLoadingReading={isLoading}
    />
  );
};

export default CardSelectionPage;
