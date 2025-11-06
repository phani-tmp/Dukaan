import React from 'react';
import { Search } from 'lucide-react';
import { translations } from '../../constants/translations';
import VoiceSearch from './VoiceSearch';

const AppHeader = ({ searchTerm, setSearchTerm, language, toggleLanguage, logoUrl, products, onVoiceSearch }) => {
  const t = translations[language];
  const defaultLogo = '/dukaan-logo.png';
  
  return (
    <div className="app-header-modern">
      <div className="header-top">
        <div className="brand-section">
          <img 
            src={logoUrl || defaultLogo} 
            alt="DUKAAN Logo" 
            className="header-logo"
          />
          <div className="brand-text">
            <h1 className="brand-name">DUKAAN</h1>
            <p className="brand-name-telugu">దుకాణ్</p>
          </div>
        </div>
        <button onClick={toggleLanguage} className="language-toggle-modern">
          {language === 'en' ? 'EN' : 'తె'}
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
