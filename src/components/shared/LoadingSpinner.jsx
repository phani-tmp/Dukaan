import React, { useState, useEffect } from 'react';

const LoadingSpinner = () => {
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { getFirebaseInstances, appId } = await import('../../services/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = getFirebaseInstances();
        
        const settingsDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'branding'));
        if (settingsDoc.exists() && settingsDoc.data().logoUrl) {
          setLogoUrl(settingsDoc.data().logoUrl);
        } else {
          setLogoUrl('/dukaan-logo.png');
        }
      } catch (error) {
        console.log('Using default logo');
        setLogoUrl('/dukaan-logo.png');
      }
    };
    
    fetchLogo();
  }, []);

  return (
    <div className="flex-center p-8" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="DUKAAN Logo" 
            style={{ 
              width: '200px', 
              height: '200px', 
              objectFit: 'contain',
              marginBottom: '32px',
              animation: 'pulse 2s ease-in-out infinite'
            }} 
          />
        ) : (
          <div style={{
            width: '200px',
            height: '200px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: '#2E7D32',
              textAlign: 'center',
              animation: 'pulse 2s ease-in-out infinite'
            }}>DUKAAN<br/>దుకాణ్</h1>
          </div>
        )}
        <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-white" style={{
          borderWidth: '4px',
          borderStyle: 'solid',
          borderColor: '#4CAF50',
          borderBottomColor: 'transparent',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ 
          marginTop: '24px', 
          color: '#2E7D32', 
          fontWeight: '600',
          fontSize: '18px'
        }}>Loading...</p>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
