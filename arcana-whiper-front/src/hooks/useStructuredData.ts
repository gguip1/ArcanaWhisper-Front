import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useStructuredData = () => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": i18n.language === 'ko' ? "ArcanaWhisper - AI 타로 리딩" : "ArcanaWhisper - AI Tarot Reading",
      "description": i18n.language === 'ko' 
        ? "AI 타로 리딩으로 당신의 운명을 알아보세요. 타로 카드와 인공지능이 속삭이는 운명의 메시지를 지금 확인하세요."
        : "Discover your destiny with AI Tarot Reading. Experience mystical tarot wisdom through artificial intelligence.",
      "url": "https://aitarot.site",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "ArcanaWhisper"
      },
      "inLanguage": [
        {
          "@type": "Language",
          "name": i18n.language === 'ko' ? "Korean" : "English",
          "alternateName": i18n.language === 'ko' ? "ko" : "en"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      },
      "featureList": [
        i18n.language === 'ko' ? "AI 기반 타로 카드 해석" : "AI-powered tarot card interpretation",
        i18n.language === 'ko' ? "실시간 카드 선택" : "Real-time card selection",
        i18n.language === 'ko' ? "개인화된 운세 분석" : "Personalized fortune analysis",
        i18n.language === 'ko' ? "히스토리 관리" : "History management"
      ]
    };

    // 기존 JSON-LD 스크립트 제거
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // 새 JSON-LD 스크립트 추가
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [i18n.language]);
};

export default useStructuredData;
