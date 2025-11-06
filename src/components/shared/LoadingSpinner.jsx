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
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt="DUKAAN Logo" 
          style={{ 
            width: '120px', 
            height: '120px', 
            objectFit: 'contain',
            marginBottom: '24px',
            animation: 'pulse 2s ease-in-out infinite'
          }} 
        />
      ) : (
        <div style={{
          width: '120px',
          height: '120px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: 'white',
            textAlign: 'center',
            animation: 'pulse 2s ease-in-out infinite'
          }}>DUKAAN<br/>దుకాణ్</h1>
        </div>
      )}
      <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-white" style={{
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: 'white',
        borderBottomColor: 'transparent',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ 
        marginTop: '20px', 
        color: 'white', 
        fontWeight: '600',
        fontSize: '16px'
      }}>Loading...</p>
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
