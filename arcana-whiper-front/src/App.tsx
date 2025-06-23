import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import CardSelection from './components/CardSelection'
import PageTransition from './components/PageTransition'
import ReadingResult from './components/ReadingResult'
import { GlobalErrorModal } from './components/ErrorModal'
import LoginButton from './components/LoginButton'
import QuestionInput from './components/QuestionInput'
import TarotHistory from './components/TarotHistory'
import { requestTarotReading } from './services/tarotService'
import authService from './services/authService'
import errorService from './services/errorService'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { useAsyncOperation } from './hooks/useAsyncOperation'

// 선택된 카드 정보를 저장하는 인터페이스 추가
interface SelectedCardInfo {
  id: number;      // 카드 ID
  number: number;  // 카드 번호
  reversed: boolean; // 역방향 여부
}

// 페이지 전환 타입 정의 (PageTransition 컴포넌트의 targetPage와 일치시킴)
type PageType = 'home' | 'question' | 'cardSelection' | 'result' | 'history';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [selectedCards, setSelectedCards] = useState<SelectedCardInfo[]>([]) // 카드 정보 타입 변경
  const MAX_CARDS = 3
  const [isTransitioning, setIsTransitioning] = useState(false)
    // useAsyncOperation으로 API 요청 상태 관리
  const {
    loading: isLoading,
    execute: executeReading,
    reset: resetReading
  } = useAsyncOperation<string>();
  
  const [readingResult, setReadingResult] = useState<string>('')
  
  // 타로 질문 상태 추가
  const [tarotQuestion, setTarotQuestion] = useState<string>('')

  // 현재 진행 중인 페이지 전환의 목표 페이지 - 타입 수정
  const [targetPage, setTargetPage] = useState<PageType>('home');

  // 페이지 전환 시작 함수 - 타이밍 최적화
  const startTransition = (nextPage: PageType) => {
    setTargetPage(nextPage);
    setIsTransitioning(true);
    
    // 목표 페이지를 먼저 설정하고, 약간의 지연 후에 전환 애니메이션을 종료
    setCurrentPage(nextPage); // 즉시 페이지 변경
    
    // 애니메이션 효과를 위한 타이머만 유지
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000); // 전체 애니메이션 시간
  };

  const handleStartReading = () => {
    startTransition('question');
  }
  
  // 질문 제출 처리
  const handleQuestionSubmit = (question: string) => {
    setTarotQuestion(question);
    startTransition('cardSelection');
  }
  
  // 질문 취소 (로딩 없이 홈으로 이동)
  const handleQuestionCancel = () => {
    setCurrentPage('home');
  }

  const handleCardSelect = (cardId: number, cardNumber: number) => {
    if (selectedCards.find(card => card.id === cardId)) {
      setSelectedCards(selectedCards.filter(card => card.id !== cardId));
    } else {
      if (selectedCards.length < MAX_CARDS) {
        // 선택된 카드에 무작위로 정/역방향 부여 (사용자에게는 보이지 않음)
        const newCard: SelectedCardInfo = {
          id: cardId,
          number: cardNumber,
          reversed: Math.random() < 0.5 // 50% 확률로 역방향
        };
        setSelectedCards([...selectedCards, newCard]);
      }
    }
  };

  const handleResetCards = () => {
    setSelectedCards([]);
  }
    const handleRequestReading = async (selectedCardInfos: SelectedCardInfo[]) => {
    try {
      const result = await executeReading(async () => {
        // 로그인 상태 확인
        const currentUser = authService.currentUser;
        
        // 카드 번호와 방향 정보 추출
        const cardNumbers = selectedCardInfos.map(card => card.number);
        const cardDirections = selectedCardInfos.map(card => card.reversed);
        
        // API 요청 데이터 구성
        const requestData = {
          cards: {
            cards: cardNumbers,
            reversed: cardDirections
          },
          question: tarotQuestion,
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
      startTransition('result');
      
    } catch (error) {
      console.error('타로 해석 요청 실패:', error);
      
      if (error instanceof Error) {
        errorService.showError(error.message);
      } else {
        errorService.showError('알 수 없는 오류가 발생했습니다');
      }
    }
  };
    const handleNewReading = () => {
    handleResetCards();
    setTarotQuestion(''); // 질문 초기화
    setReadingResult(''); // 결과 초기화
    resetReading(); // API 상태 초기화
    startTransition('question');
  };
  
  // 홈으로 이동 (로딩 없이)
  const handleGoHome = () => {
    handleResetCards();
    setReadingResult('');
    setTarotQuestion(''); // 질문 초기화
    resetReading(); // API 상태 초기화
    setCurrentPage('home');
  };

  // 질문 다시하기 핸들러 수정 (로딩 없이 이동)
  const handleReQuestion = () => {
    handleResetCards(); // 카드 선택 초기화
    setCurrentPage('question');
  };

  // 히스토리 페이지 관련 핸들러 수정
  const handleViewHistory = () => {
    // 로딩 없이 즉시 이동
    setCurrentPage('history');
  };

  const handleHistoryGoHome = () => {
    // 히스토리에서 홈으로 돌아갈 때 선택된 카드 상태 초기화
    handleResetCards();
    setReadingResult('');
    setTarotQuestion('');
    // 로딩 없이 즉시 이동
    setCurrentPage('home');
  };

  // PageTransition이 필요한지 결정하는 함수 수정
  const shouldShowTransition = () => {
    // 로딩 중일 때는 항상 표시
    if (isLoading) return true;
    
    // 전환 중일 때만 표시 (페이지는 이미 변경되어 있음)
    return isTransitioning;
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
      
      {currentPage === 'home' && !isLoading && (
        <div className={isTransitioning ? "page-hidden" : "page-visible"}>
          <Home onStartReading={handleStartReading} />
        </div>
      )}
      
      {/* 질문 입력 페이지 추가 */}
      {currentPage === 'question' && !isLoading && (
        <div className={isTransitioning ? "page-hidden" : "page-visible"}>
          <QuestionInput
            onSubmit={handleQuestionSubmit}
            onCancel={handleQuestionCancel}
          />
        </div>
      )}
        {currentPage === 'cardSelection' && (
        <div className={isTransitioning ? "page-hidden" : "page-visible"}>
          <CardSelection 
            selectedCards={selectedCards.map(card => card.id)} // ID만 전달하여 방향 정보를 숨김
            onCardSelect={(cardId, cardNumber) => handleCardSelect(cardId, cardNumber)}
            maxCards={MAX_CARDS}
            onResetCards={handleResetCards}
            onRequestReading={() => handleRequestReading(selectedCards)}
            onGoHome={handleGoHome}
            onReQuestion={handleReQuestion}
            question={tarotQuestion}
            isLoadingReading={isLoading} // API 요청 로딩 상태 전달
          />
        </div>
      )}
      
      {currentPage === 'result' && !isLoading && (
        <div className={isTransitioning ? "page-hidden" : "page-visible"}>
          <ReadingResult 
            markdown={readingResult}
            onNewReading={handleNewReading}
            onGoHome={handleGoHome}
            question={tarotQuestion}
            selectedCardInfos={selectedCards} // 카드 방향 정보를 포함한 데이터 전달
          />
        </div>
      )}
      
      {/* 타로 히스토리 페이지 추가 */}
      {currentPage === 'history' && !isLoading && (
        <div className={isTransitioning ? "page-hidden" : "page-visible"}>
          <TarotHistory onGoHome={handleHistoryGoHome} />
        </div>
      )}
      
      {/* 페이지 전환 및 로딩 상태일 때 PageTransition 표시 */}
      {(shouldShowTransition() || isLoading) && (
        <PageTransition 
          targetPage={isLoading ? 'result' : targetPage}
          customMessage={isLoading ? '타로 카드의 지혜를 듣고 있습니다...' : undefined}
        />
      )}
      
      {/* 기존 에러 모달 대신 글로벌 에러 모달 사용 */}
      <GlobalErrorModal />

      {/* PWA 설치 프롬프트 추가 */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
