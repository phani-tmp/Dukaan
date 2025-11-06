import React from 'react';
import { Search } from 'lucide-react';
import { translations } from '../../constants/translations';
import VoiceSearch from './VoiceSearch';

const AppHeader = ({ searchTerm, setSearchTerm, language, toggleLanguage, logoUrl, products, onVoiceSearch }) => {
  const t = translations[language];
  const fallbackLogo = '/dukaan-logo.png';
  
  return (
    <div className="app-header-modern">
      <div className="header-top">
        <div className="brand-section">
          <img 
            src={logoUrl || fallbackLogo} 
            alt="DUKAAN Logo" 
            className="header-logo"
          />
          <h1 className="brand-name">
            {language === 'en' ? 'DUKAAN' : 'దుకాణ్'}
          </h1>
        </div>
        <button onClick={toggleLanguage} className="language-toggle-modern">
          తెలుగు/EN
        </button>
      </div>

      <div className="search-bar-modern">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {products && onVoiceSearch && (
          <VoiceSearch
            products={products}
            onProductsFound={onVoiceSearch}
            language={language}
          />
        )}
      </div>
    </div>
  );
};

export default AppHeader;
