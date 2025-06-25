import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 한국어 번역
const ko = {
  translation: {
    // 홈 페이지
    home: {
      title: "ArcanaWhisper",
      tagline: "타로 카드와 LLM이 속삭이는 운명의 메시지",
      description: "Arcana Whisper는 인공지능을 통해 타로 카드 리딩을 경험할 수 있는 타로 서비스입니다. 신비로운 타로의 세계와 인공지능의 힘이 만나, 지금 이 순간 당신에게 필요한 메시지를 전해드립니다.",
      startButton: "운명의 메시지 시작하기",
      disclaimer: {
        entertainment: "Arcana Whisper는 오락 및 자기 성찰용으로 제공됩니다.",
        decisions: "실제 인생 결정은 전문가 상담 및 자신의 판단을 기반으로 하길 권장합니다.",
        analysis: "이 앱은 사용자의 심리 상태를 분석하거나 예언하지 않습니다."
      }
    },
    
    // 질문 입력 페이지
    question: {
      title: "타로에게 질문하기",
      subtitle: "마음속에 품고 있던 질문을 입력해주세요",
      placeholder: "예: 나의 연애운은 어떨까요?",
      submitButton: "질문 완료",
      cancelButton: "취소",
      validation: {
        required: "질문을 입력해주세요.",
        minLength: "질문은 최소 5글자 이상 입력해주세요.",
        maxLength: "질문은 200글자 이하로 입력해주세요."
      }
    },
    
    // 카드 선택 페이지
    cardSelection: {
      title: "타로 카드 선택",
      subtitle: "직감을 믿고 3장의 카드를 선택해주세요",
      selectedCount: "{{count}}/3장 선택됨",
      shuffleButton: "카드 섞기",
      resetButton: "다시 선택",
      readingButton: "운명의 메시지 확인하기",
      homeButton: "홈으로",
      reQuestionButton: "질문 다시하기",
      loading: {
        preparing: "카드를 준비하고 있습니다...",
        shuffling: "카드를 섞고 있습니다...",
        reading: "운명의 메시지를 읽고 있습니다..."
      }
    },
    
    // 결과 페이지
    result: {
      title: "타로 카드 해석 결과",
      question: "질문",
      selectedCards: "선택된 카드",
      newReadingButton: "새로운 리딩",
      homeButton: "홈으로",
      shareButton: "결과 공유",
      saveButton: "결과 저장",
      positions: {
        first: "첫번째",
        second: "두번째",
        third: "세번째"
      }
    },
    
    // 히스토리 페이지
    history: {
      title: "타로 기록",
      subtitle: "당신의 질문과 타로의 지혜를 모아봤어요",
      empty: {
        main: "아직 타로 카드 기록이 없습니다.",
        sub: "질문하고 타로 카드의 지혜를 들어보세요.",
        startButton: "첫 타로 카드 읽기 시작하기"
      },
      loadMore: "더 불러오는 중...",
      allLoaded: "모든 타로 카드 기록을 불러왔습니다.",
      homeButton: "홈으로",
      reversed: "역"
    },
    
    // 로그인 관련
    auth: {
      loginButton: "로그인",
      logoutButton: "로그아웃",
      loginWith: "{{provider}}로 로그인",
      profile: "프로필",
      historyButton: "타로 기록 보기",
      loading: "로그인 중...",
      error: {
        loginFailed: "로그인에 실패했습니다.",
        networkError: "네트워크 오류가 발생했습니다."
      }
    },
    
    // 공통 요소
    common: {
      loading: "로딩 중...",
      error: "오류가 발생했습니다",
      retry: "다시 시도",
      close: "닫기",
      confirm: "확인",
      cancel: "취소",
      save: "저장",
      delete: "삭제",
      edit: "편집",
      back: "뒤로",
      expand: "펼치기"
    },
    
    // 에러 메시지
    errors: {
      networkError: "네트워크 연결을 확인해주세요.",
      serverError: "서버 오류가 발생했습니다.",
      unknownError: "알 수 없는 오류가 발생했습니다.",
      sessionExpired: "세션이 만료되었습니다. 다시 로그인해주세요."
    },
    
    // PWA 관련
    pwa: {
      installTitle: "앱 설치",
      installMessage: "ArcanaWhisper를 설치하시겠습니까?",
      installButton: "설치",
      laterButton: "나중에"
    }
  }
};

// 영어 번역
const en = {
  translation: {
    // Home page
    home: {
      title: "ArcanaWhisper",
      tagline: "Messages of fate whispered by Tarot cards and LLM",
      description: "Arcana Whisper is a tarot service where you can experience tarot card readings through artificial intelligence. The mystical world of tarot meets the power of AI to deliver the message you need right now.",
      startButton: "Start Your Destiny Reading",
      disclaimer: {
        entertainment: "Arcana Whisper is provided for entertainment and self-reflection purposes.",
        decisions: "We recommend making actual life decisions based on professional consultation and your own judgment.",
        analysis: "This app does not analyze or predict users' psychological states."
      }
    },
    
    // Question input page
    question: {
      title: "Ask the Tarot",
      subtitle: "Please enter the question you've been holding in your heart",
      placeholder: "e.g., What does my love life look like?",
      submitButton: "Submit Question",
      cancelButton: "Cancel",
      validation: {
        required: "Please enter your question.",
        minLength: "Question must be at least 5 characters long.",
        maxLength: "Question must be no more than 200 characters."
      }
    },
    
    // Card selection page
    cardSelection: {
      title: "Select Tarot Cards",
      subtitle: "Trust your intuition and select 3 cards",
      selectedCount: "{{count}}/3 cards selected",
      shuffleButton: "Shuffle Cards",
      resetButton: "Reset Selection",
      readingButton: "Get Your Destiny Message",
      homeButton: "Home",
      reQuestionButton: "Ask Again",
      loading: {
        preparing: "Preparing cards...",
        shuffling: "Shuffling cards...",
        reading: "Reading your destiny message..."
      }
    },
    
    // Result page
    result: {
      title: "Tarot Reading Results",
      question: "Question",
      selectedCards: "Selected Cards",
      newReadingButton: "New Reading",
      homeButton: "Home",
      shareButton: "Share Result",
      saveButton: "Save Result",
      positions: {
        first: "First",
        second: "Second",
        third: "Third"
      }
    },
    
    // History page
    history: {
      title: "Tarot History",
      subtitle: "Your questions and tarot wisdom collected",
      empty: {
        main: "No tarot records yet.",
        sub: "Ask questions and listen to the wisdom of tarot cards.",
        startButton: "Start Your First Tarot Reading"
      },
      loadMore: "Loading more...",
      allLoaded: "All tarot records have been loaded.",
      homeButton: "Home",
      reversed: "Reversed"
    },
    
    // Authentication
    auth: {
      loginButton: "Login",
      logoutButton: "Logout",
      loginWith: "Login with {{provider}}",
      profile: "Profile",
      historyButton: "View Tarot History",
      loading: "Logging in...",
      error: {
        loginFailed: "Login failed.",
        networkError: "Network error occurred."
      }
    },
    
    // Common elements
    common: {
      loading: "Loading...",
      error: "An error occurred",
      retry: "Retry",
      close: "Close",
      confirm: "Confirm",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      back: "Back",
      expand: "Expand"
    },
    
    // Error messages
    errors: {
      networkError: "Please check your network connection.",
      serverError: "Server error occurred.",
      unknownError: "An unknown error occurred.",
      sessionExpired: "Session expired. Please login again."
    },
    
    // PWA related
    pwa: {
      installTitle: "Install App",
      installMessage: "Would you like to install ArcanaWhisper?",
      installButton: "Install",
      laterButton: "Later"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko,
      en
    },
    fallbackLng: 'ko', // 기본 언어를 한국어로 설정
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
