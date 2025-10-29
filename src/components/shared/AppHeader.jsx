import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { translations } from '../../constants/translations';
import VoiceSearch from './VoiceSearch';

const AppHeader = ({ searchTerm, setSearchTerm, location, language, toggleLanguage, logoUrl, products, onVoiceSearch }) => {
  const t = translations[language];
  
  return (
    <div className="app-header-modern">
      <div className="location-bar">
        <div className="location-info">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="app-logo" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          <span className="location-text">{location || 'Ponnur, AP'}</span>
        </div>
        <button onClick={toggleLanguage} className="language-toggle">
          {language === 'en' ? 'EN / తెలుగు' : 'తెలుగు / EN'}
        </button>
      </div>

      <h1 className="app-title">{t.appName}</h1>

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
