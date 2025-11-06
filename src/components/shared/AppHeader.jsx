import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { translations } from '../../constants/translations';
import VoiceSearch from './VoiceSearch';

const AppHeader = ({ searchTerm, setSearchTerm, location, language, toggleLanguage, logoUrl, products, onVoiceSearch }) => {
  const t = translations[language];
  const defaultLogo = '/dukaan-logo.png';
  
  return (
    <div className="app-header-modern">
      <div className="location-bar" style={{ flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
        <div className="location-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <MapPin className="w-4 h-4" style={{ flexShrink: 0 }} />
            <span className="location-text" style={{ fontSize: '13px', flex: 1 }}>{location || 'Getting location...'}</span>
          </div>
          <button onClick={toggleLanguage} className="language-toggle" style={{ fontSize: '14px', fontWeight: '600', padding: '4px 12px' }}>
            {language === 'en' ? 'EN' : 'తె'}
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', width: '100%' }}>
          <img 
            src={logoUrl || defaultLogo} 
            alt="DUKAAN Logo" 
            style={{ 
              width: '40px', 
              height: '40px', 
              objectFit: 'contain',
              borderRadius: '8px'
            }} 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <h1 
            style={{ 
              display: 'none',
              fontSize: '24px', 
              fontWeight: '700', 
              letterSpacing: '0.5px',
              color: 'white',
              margin: 0
            }}
          >
            {t.appName}
          </h1>
        </div>
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
