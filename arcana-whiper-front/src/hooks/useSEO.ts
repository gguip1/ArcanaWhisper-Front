import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical?: string;
}

export const useSEO = (data: SEOData = {}) => {
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    const language = i18n.language;
    const isKorean = language === 'ko';
    
    // 기본 SEO 데이터
    const defaultTitle = isKorean 
      ? 'ArcanaWhisper - AI 타로 리딩으로 보는 운명의 메시지'
      : 'ArcanaWhisper - AI Tarot Reading for Your Destiny';
      
    const defaultDescription = isKorean
      ? 'AI 타로 리딩으로 당신의 운명을 알아보세요. 타로 카드와 인공지능이 속삭이는 운명의 메시지를 지금 확인하세요.'
      : 'Discover your destiny with AI Tarot Reading. Experience mystical tarot wisdom through artificial intelligence.';
      
    const defaultKeywords = isKorean
      ? 'AI 타로, 인공지능 타로, 타로 리딩, 타로 카드, 운세, 운명, 점술, 미래 예측'
      : 'AI Tarot, Artificial Intelligence Tarot, Tarot Reading, Tarot Cards, Fortune, Destiny, Divination, Future Prediction';

    // 타이틀 설정
    const title = data.title || defaultTitle;
    document.title = title;
    
    // 메타 태그 업데이트
    updateMetaTag('description', data.description || defaultDescription);
    updateMetaTag('keywords', data.keywords || defaultKeywords);
    
    // Open Graph 태그
    updateMetaProperty('og:title', data.ogTitle || title);
    updateMetaProperty('og:description', data.ogDescription || data.description || defaultDescription);
    updateMetaProperty('og:locale', isKorean ? 'ko_KR' : 'en_US');
    
    // 언어 태그
    document.documentElement.lang = language;
    
    // hreflang 태그 추가
    updateAlternateLinks();
    
    // Canonical URL
    if (data.canonical) {
      updateCanonicalLink(data.canonical);
    }
    
  }, [data, i18n.language, t]);
};

// 메타 태그 업데이트 헬퍼 함수
const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
};

// Open Graph 메타 태그 업데이트
const updateMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
};

// hreflang 링크 업데이트
const updateAlternateLinks = () => {
  // 기존 hreflang 링크 제거
  const existingLinks = document.querySelectorAll('link[hreflang]');
  existingLinks.forEach(link => link.remove());
  
  // 새 hreflang 링크 추가
  const baseUrl = 'https://aitarot.site';
  const languages = [
    { code: 'ko', hreflang: 'ko' },
    { code: 'en', hreflang: 'en' },
    { code: 'x-default', hreflang: 'x-default' }
  ];
  
  languages.forEach(({ code, hreflang }) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    link.href = hreflang === 'x-default' ? baseUrl : `${baseUrl}?lang=${code}`;
    document.head.appendChild(link);
  });
};

// Canonical URL 업데이트
const updateCanonicalLink = (url: string) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
};

export default useSEO;
