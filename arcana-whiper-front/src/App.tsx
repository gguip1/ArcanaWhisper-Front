import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import CardSelection from './components/CardSelection'
import PageTransition from './components/PageTransition'
import ReadingResult from './components/ReadingResult'
import ErrorModal from './components/ErrorModal'
import LoginButton from './components/LoginButton'
import QuestionInput from './components/QuestionInput'
import TarotHistory from './components/TarotHistory'
import { requestTarotReading } from './services/tarotService'
import authService from './services/authService'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const MAX_CARDS = 3
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [readingResult, setReadingResult] = useState<string>('')
  
  // 타로 질문 상태 추가
  const [tarotQuestion, setTarotQuestion] = useState<string>('')

  const handleStartReading = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      // 카드 선택 대신 질문 입력 페이지로 이동
      setCurrentPage('question')
      setTimeout(() => {
        setIsTransitioning(false)
      }, 1000)
    }, 1500)
  }
  
  // 질문 제출 처리
  const handleQuestionSubmit = (question: string) => {
    setTarotQuestion(question)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentPage('cardSelection')
      setTimeout(() => {
        setIsTransitioning(false)
      }, 1000)
    }, 1500)
  }
  
  // 질문 취소
  const handleQuestionCancel = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentPage('home')
      setTimeout(() => {
        setIsTransitioning(false)
      }, 1000)
    }, 1500)
  }

  const handleCardSelect = (cardId: number) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId))
    } else {
      if (selectedCards.length < MAX_CARDS) {
        setSelectedCards([...selectedCards, cardId])
      }
    }
  }

  const handleResetCards = () => {
    setSelectedCards([]);
  }
  
  const handleRequestReading = async (cardNumbers: number[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 로그인 상태 확인
      const currentUser = authService.currentUser;
      
      // API 요청 데이터 구성
      const requestData = {
        cards: cardNumbers,
        question: tarotQuestion, // 질문 추가
        // 로그인 상태일 때만 user_id, provider 추가
        ...(currentUser && {
          user_id: currentUser.uid,
          provider: currentUser.provider
        })
      };
      
      const response = await requestTarotReading(requestData);
      setReadingResult(response.result);
      
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage('result');
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1000);
      }, 1500);
      
    } catch (error) {
      console.error('타로 해석 요청 실패:', error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다');
      }
      
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewReading = () => {
    handleResetCards();
    setTarotQuestion(''); // 질문 초기화
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage('question'); // 결과 → 질문 페이지로 변경
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }, 1500);
  };
  
  const handleGoHome = () => {
    handleResetCards();
    setReadingResult('');
    setTarotQuestion(''); // 질문 초기화
    setCurrentPage('home');
  };
  
  const handleCloseError = () => {
    setError(null);
  };

  // 질문 다시하기 핸들러 추가
  const handleReQuestion = () => {
    handleResetCards(); // 카드 선택 초기화
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage('question');
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }, 1500);
  };

  // 히스토리 페이지 관련 핸들러 추가
  const handleViewHistory = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage('history');
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }, 1500);
  };

  const handleHistoryGoHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage('home');
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="app-container">
      {/* 로그인 버튼에 히스토리 보기 핸들러와 현재 페이지 정보 전달 */}
      <LoginButton 
        position="fixed" 
        providers={['google', 'kakao']} 
        onViewHistory={handleViewHistory}
        currentPage={currentPage}
      />
      
      {currentPage === 'home' && !isTransitioning && !isLoading && (
        <Home onStartReading={handleStartReading} />
      )}
      
      {/* 질문 입력 페이지 추가 */}
      {currentPage === 'question' && !isTransitioning && !isLoading && (
        <QuestionInput
          onSubmit={handleQuestionSubmit}
          onCancel={handleQuestionCancel}
        />
      )}
      
      {currentPage === 'cardSelection' && !isTransitioning && !isLoading && (
        <CardSelection 
          selectedCards={selectedCards} 
          onCardSelect={handleCardSelect}
          maxCards={MAX_CARDS}
          onResetCards={handleResetCards}
          onRequestReading={handleRequestReading}
          onGoHome={handleGoHome}
          onReQuestion={handleReQuestion}
          question={tarotQuestion}
        />
      )}
      
      {currentPage === 'result' && !isTransitioning && !isLoading && (
        <ReadingResult 
          markdown={readingResult}
          onNewReading={handleNewReading}
          onGoHome={handleGoHome}
          question={tarotQuestion}
          selectedCardNumbers={selectedCards}
        />
      )}
      
      {/* 타로 히스토리 페이지 추가 */}
      {currentPage === 'history' && !isTransitioning && !isLoading && (
        <TarotHistory onGoHome={handleHistoryGoHome} />
      )}
      
      {(isTransitioning || isLoading) && (
        <PageTransition 
          targetPage={
            isLoading ? 'result' : 
            currentPage === 'home' ? 'question' : 
            currentPage === 'question' ? 'cardSelection' : 
            currentPage === 'cardSelection' ? 'result' : 
            currentPage === 'history' ? 'home' : 'question'
          }
          customMessage={isLoading ? '타로 카드의 지혜를 듣고 있습니다...' : undefined}
        />
      )}
      
      {error && <ErrorModal message={error} onClose={handleCloseError} />}
    </div>
  );
}

export default App;
