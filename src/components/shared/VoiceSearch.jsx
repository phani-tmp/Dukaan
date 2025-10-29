import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
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
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        onVoiceStart?.();
      };

      recognitionRef.current.onresult = async (event) => {
        const transcriptText = event.results[0][0].transcript;
        await handleVoiceSearch(transcriptText);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('[Voice] Recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        onVoiceEnd?.();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
        onVoiceEnd?.();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

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
      console.error('[Voice] Search error:', error);
      onProductsFound([], '');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const supportsVoice = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!supportsVoice) return null;

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
