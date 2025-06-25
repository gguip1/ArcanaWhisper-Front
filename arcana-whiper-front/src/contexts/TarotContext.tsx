import React, { createContext, useReducer, ReactNode } from 'react';
import { TarotState, TarotAction, PageType, SelectedCardInfo } from '../types';

// 초기 상태 정의
const initialState: TarotState = {
  selectedCards: [],
  question: '',
  readingResult: '',
  isLoading: false,
  currentPage: 'home',
};

// 리듀서 함수
const tarotReducer = (state: TarotState, action: TarotAction): TarotState => {
  switch (action.type) {
    case 'SET_SELECTED_CARDS':
      return { ...state, selectedCards: action.payload };
    case 'SET_QUESTION':
      return { ...state, question: action.payload };
    case 'SET_READING_RESULT':
      return { ...state, readingResult: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

// Context 타입 정의
interface TarotContextType {
  state: TarotState;
  dispatch: React.Dispatch<TarotAction>;
  // 편의 함수들
  setSelectedCards: (cards: SelectedCardInfo[]) => void;
  setQuestion: (question: string) => void;
  setReadingResult: (result: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: PageType) => void;
  resetState: () => void;
}

// Context 생성
export const TarotContext = createContext<TarotContextType | undefined>(undefined);

// Provider Props 타입
interface TarotProviderProps {
  children: ReactNode;
}

// Provider 컴포넌트
export const TarotProvider: React.FC<TarotProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(tarotReducer, initialState);

  // 편의 함수들
  const setSelectedCards = (cards: SelectedCardInfo[]) => {
    dispatch({ type: 'SET_SELECTED_CARDS', payload: cards });
  };

  const setQuestion = (question: string) => {
    dispatch({ type: 'SET_QUESTION', payload: question });
  };

  const setReadingResult = (result: string) => {
    dispatch({ type: 'SET_READING_RESULT', payload: result });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setCurrentPage = (page: PageType) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  const value: TarotContextType = {
    state,
    dispatch,
    setSelectedCards,
    setQuestion,
    setReadingResult,
    setLoading,
    setCurrentPage,
    resetState,
  };
  return (
    <TarotContext.Provider value={value}>
      {children}
    </TarotContext.Provider>
  );
};

// 커스텀 훅 - TarotContext를 쉽게 사용하기 위한 훅
export const useTarot = (): TarotContextType => {
  const context = React.useContext(TarotContext);
  if (context === undefined) {
    throw new Error('useTarot must be used within a TarotProvider');
  }
  return context;
};
