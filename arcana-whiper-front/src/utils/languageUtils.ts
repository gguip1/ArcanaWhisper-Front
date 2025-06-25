// 언어 감지 및 설정 유틸리티
export const detectLanguage = (): string => {
  // 1. URL 파라미터에서 언어 확인
  const urlParams = new URLSearchParams(window.location.search);
  const langFromUrl = urlParams.get('lang');
  
  if (langFromUrl && ['ko', 'en'].includes(langFromUrl)) {
    return langFromUrl;
  }
  
  // 2. 로컬 스토리지에서 저장된 언어 확인
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && ['ko', 'en'].includes(savedLang)) {
    return savedLang;
  }
  
  // 3. 브라우저 언어 확인
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
  // 한국어 감지 (ko, ko-KR, ko-*)
  if (browserLang.toLowerCase().startsWith('ko')) {
    return 'ko';
  }
  
  // 기본값은 영어
  return 'en';
};

// 언어 변경 시 URL 업데이트
export const updateLanguageInUrl = (language: string) => {
  const url = new URL(window.location.href);
  
  if (language === 'en') {
    // 영어일 때는 URL에서 lang 파라미터 제거 (기본 언어)
    url.searchParams.delete('lang');
  } else {
    // 다른 언어일 때는 URL에 lang 파라미터 추가
    url.searchParams.set('lang', language);
  }
  
  // URL 업데이트 (페이지 새로고침 없이)
  window.history.replaceState({}, '', url.toString());
  
  // SEO용 hreflang 링크 업데이트
  updateHrefLangLinks();
};

// hreflang 링크 동적 업데이트
const updateHrefLangLinks = () => {
  // 기존 hreflang 링크 제거
  const existingLinks = document.querySelectorAll('link[hreflang]');
  existingLinks.forEach(link => link.remove());
  
  // 새 hreflang 링크 추가
  const baseUrl = 'https://aitarot.site';
  const currentPath = window.location.pathname;
  
  const languages = [
    { code: 'ko', hreflang: 'ko' },
    { code: 'en', hreflang: 'en' },
    { code: 'x-default', hreflang: 'x-default' }
  ];
  
  languages.forEach(({ code, hreflang }) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    
    if (hreflang === 'x-default' || code === 'en') {
      link.href = `${baseUrl}${currentPath}`;
    } else {
      link.href = `${baseUrl}${currentPath}?lang=${code}`;
    }
    
    document.head.appendChild(link);
  });
};
