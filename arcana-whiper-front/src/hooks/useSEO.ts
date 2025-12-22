import { useEffect } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical?: string;
}

export const useSEO = (data: SEOData = {}) => {
  useEffect(() => {
    // 기본 SEO 데이터 (한국어만 지원)
    const defaultTitle = 'ArcanaWhisper - AI 타로 리딩으로 보는 운명의 메시지';
    const defaultDescription = 'AI 타로 리딩으로 당신의 운명을 알아보세요. 타로 카드와 인공지능이 속삭이는 운명의 메시지를 지금 확인하세요.';
    const defaultKeywords = 'AI 타로, 인공지능 타로, 타로 리딩, 타로 카드, 운세, 운명, 점술, 미래 예측';

    // 타이틀 설정
    const title = data.title || defaultTitle;
    document.title = title;
    
    // 메타 태그 업데이트
    updateMetaTag('description', data.description || defaultDescription);
    updateMetaTag('keywords', data.keywords || defaultKeywords);
    
    // Open Graph 태그
    updateMetaProperty('og:title', data.ogTitle || title);
    updateMetaProperty('og:description', data.ogDescription || data.description || defaultDescription);
    updateMetaProperty('og:locale', 'ko_KR');

    // 언어 태그 (한국어 고정)
    document.documentElement.lang = 'ko';

    // Canonical URL
    if (data.canonical) {
      updateCanonicalLink(data.canonical);
    }

  }, [data]);
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
