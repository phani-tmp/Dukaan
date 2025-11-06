import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { translateToProductName, semanticProductSearch } from '../../services/gemini';
import { buildProductContext } from '../../constants/productSynonyms';

export default function VoiceSearch({ 
  products, 
  onProductsFound,
  language,
  onVoiceStart,
  onVoiceEnd
}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    if (isNative) {
      try {
        const { available } = await SpeechRecognition.available();
        setIsAvailable(available);
        
        if (available) {
          const { granted } = await SpeechRecognition.checkPermissions();
          if (!granted) {
            await SpeechRecognition.requestPermissions();
          }
        }
      } catch (error) {
        console.error('[VoiceSearch] Capacitor availability check failed:', error);
        setIsAvailable(false);
      }
    } else {
      const webSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setIsAvailable(webSupport);
    }
  };

  const handleVoiceSearch = async (text) => {
    setIsProcessing(true);

    try {
      const productContext = buildProductContext(products);
      const matchedProducts = await translateToProductName(text, productContext);
      
      if (matchedProducts && matchedProducts.length > 0) {
        const foundProducts = products.filter(p => 
          matchedProducts.some(m => m.productId === p.id)
        );
        
        if (foundProducts.length > 0) {
          onProductsFound(foundProducts, text);
          return;
        }
      }
      
      const searchResults = await semanticProductSearch(text, products);
      if (searchResults.length > 0) {
        onProductsFound(searchResults, text);
      } else {
        onProductsFound([], text);
      }
    } catch (error) {
      console.error('[VoiceSearch] Search error:', error);
      onProductsFound([], '');
    } finally {
      setIsProcessing(false);
    }
  };

  const startNativeListening = async () => {
    try {
      const lang = language === 'te' ? 'te-IN' : 'en-IN';
      
      await SpeechRecognition.start({
        language: lang,
        maxResults: 1,
        prompt: language === 'te' ? 'వెతకండి...' : 'Search...',
        partialResults: false,
        popup: true
      });

      setIsListening(true);
      onVoiceStart?.();

      const result = await new Promise((resolve, reject) => {
        SpeechRecognition.addListener('listeningState', (state) => {
          if (state.status === 'stopped') {
            setIsListening(false);
            onVoiceEnd?.();
          }
        });

        let hasResolved = false;
        SpeechRecognition.addListener('finalResults', (data) => {
          if (!hasResolved && data.matches && data.matches.length > 0) {
            hasResolved = true;
            resolve(data.matches[0]);
          }
        });

        setTimeout(() => {
          if (!hasResolved) {
            reject(new Error('Timeout'));
          }
        }, 10000);
      });

      if (result) {
        await handleVoiceSearch(result);
      }
      
      await SpeechRecognition.stop();
      setIsListening(false);
      onVoiceEnd?.();
      SpeechRecognition.removeAllListeners();
    } catch (error) {
      console.error('[VoiceSearch] Native recognition error:', error);
      setIsListening(false);
      setIsProcessing(false);
      onVoiceEnd?.();
      await SpeechRecognition.stop();
      SpeechRecognition.removeAllListeners();
    }
  };

  const startWebListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      onVoiceStart?.();
    };

    recognition.onresult = async (event) => {
      const transcriptText = event.results[0][0].transcript;
      await handleVoiceSearch(transcriptText);
    };

    recognition.onerror = (event) => {
      console.error('[VoiceSearch] Web recognition error:', event.error);
      setIsListening(false);
      setIsProcessing(false);
      onVoiceEnd?.();
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      onVoiceEnd?.();
    };

    recognition.start();
  };

  const stopListening = async () => {
    if (isNative) {
      try {
        await SpeechRecognition.stop();
        SpeechRecognition.removeAllListeners();
      } catch (error) {
        console.error('[VoiceSearch] Stop error:', error);
      }
    }
    setIsListening(false);
    setIsProcessing(false);
    onVoiceEnd?.();
  };

  const toggleListening = async () => {
    if (isListening) {
      await stopListening();
    } else {
      if (isNative) {
        await startNativeListening();
      } else {
        startWebListening();
      }
    }
  };

  if (!isAvailable) return null;

  return (
    <button
      onClick={toggleListening}
      className={`voice-search-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
      disabled={isProcessing}
      aria-label={language === 'te' ? 'వాయిస్ సెర్చ్' : 'Voice Search'}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}
