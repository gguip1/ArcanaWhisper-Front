import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import CardSelection from './components/CardSelection'
import PageTransition from './components/PageTransition'
import ReadingResult from './components/ReadingResult'
import ErrorModal from './components/ErrorModal'
import LoginButton from './components/LoginButton'
import { requestTarotReading } from './services/tarotService'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const MAX_CARDS = 3
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [readingResult, setReadingResult] = useState<string>('')

  const handleStartReading = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentPage('cardSelection')
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
      const response = await requestTarotReading(cardNumbers);
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
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage('cardSelection');
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }, 1500);
  };
  
  const handleGoHome = () => {
    handleResetCards();
    setReadingResult('');
    setCurrentPage('home');
  };
  
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div className="app-container">
      {/* 로그인 버튼 추가 - 모든 페이지에서 항상 보임 */}
      <LoginButton position="fixed" providers={['google', 'kakao']} />
      
      {currentPage === 'home' && !isTransitioning && !isLoading && (
        <Home onStartReading={handleStartReading} />
      )}
      
      {currentPage === 'cardSelection' && !isTransitioning && !isLoading && (
        <CardSelection 
          selectedCards={selectedCards} 
          onCardSelect={handleCardSelect}
          maxCards={MAX_CARDS}
          onResetCards={handleResetCards}
          onRequestReading={handleRequestReading}
          onGoHome={handleGoHome}
        />
      )}
      
      {currentPage === 'result' && !isTransitioning && !isLoading && (
        <ReadingResult 
          markdown={readingResult}
          onNewReading={handleNewReading}
          onGoHome={handleGoHome}
        />
      )}
      
      {(isTransitioning || isLoading) && (
        <PageTransition 
          targetPage={
            isLoading ? 'result' : 
            currentPage === 'home' ? 'cardSelection' : 
            currentPage === 'cardSelection' ? 'result' : 'home'
          }
          customMessage={isLoading ? '타로 카드를 해석하고 있습니다...' : undefined}
        />
      )}
      
      {error && <ErrorModal message={error} onClose={handleCloseError} />}
    </div>
  )
}

export default App
