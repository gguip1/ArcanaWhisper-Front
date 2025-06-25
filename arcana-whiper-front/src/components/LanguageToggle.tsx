import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LanguageToggle.css';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(newLang);
  };

  const currentLanguage = i18n.language;
  const isKorean = currentLanguage === 'ko';

  return (
    <button
      className={`language-toggle ${className}`}
      onClick={toggleLanguage}
      aria-label={`Change language to ${isKorean ? 'English' : '한국어'}`}
      title={`Switch to ${isKorean ? 'English' : '한국어'}`}
    >
      <div className="language-toggle-container">
        <span className={`language-option ${isKorean ? 'active' : ''}`}>
          KO
        </span>
        <div className="language-divider" />
        <span className={`language-option ${!isKorean ? 'active' : ''}`}>
          EN
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;
