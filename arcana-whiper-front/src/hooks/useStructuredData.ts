import { useEffect } from 'react';

export const useStructuredData = () => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "ArcanaWhisper - AI 타로 리딩",
      "description": "AI 타로 리딩으로 당신의 운명을 알아보세요. 타로 카드와 인공지능이 속삭이는 운명의 메시지를 지금 확인하세요.",
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
          "name": "Korean",
          "alternateName": "ko"
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
        "AI 기반 타로 카드 해석",
        "실시간 카드 선택",
        "개인화된 운세 분석",
        "히스토리 관리"
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
  }, []);
};

export default useStructuredData;
