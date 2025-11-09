import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { AudioRecorder } from '../../utils/audioRecorder';
import { transcribeAudio, translateToProductName, semanticProductSearch } from '../../services/gemini';
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
  const [isSupported, setIsSupported] = useState(true);
  const [recorder] = useState(() => new AudioRecorder());

  useEffect(() => {
    setIsSupported(AudioRecorder.isSupported());
  }, []);

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

  const startRecording = async () => {
    try {
      // Pass auto-stop callback to recorder
      await recorder.startRecording(() => {
        console.log('[VoiceSearch] Auto-stopping after silence detected');
        stopRecording();
      });
      setIsListening(true);
      onVoiceStart?.();
    } catch (error) {
      console.error('[VoiceSearch] Recording error:', error);
      
      if (error.message === 'FEATURE_NOT_SUPPORTED') {
        alert(language === 'te' 
          ? 'వాయిస్ రికార్డింగ్ మీ పరికరంలో మద్దతు లేదు' 
          : 'Voice recording is not supported on your device');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert(language === 'te' 
          ? 'మైక్రోఫోన్ యాక్సెస్ అనుమతించండి' 
          : 'Please allow microphone access');
      } else {
        alert(language === 'te' 
          ? 'వాయిస్ రికార్డింగ్ ప్రారంభించడం విఫలమైంది' 
          : 'Failed to start voice recording');
      }
    }
  };

  const stopRecording = async () => {
    try {
      setIsListening(false);
      setIsProcessing(true);

      const audioBlob = await recorder.stopRecording();
      const audioBase64 = await recorder.blobToBase64(audioBlob);
      
      console.log('[VoiceSearch] Audio recorded, sending to Gemini...');
      
      const transcribedText = await transcribeAudio(audioBase64, audioBlob.type);
      console.log('[VoiceSearch] Transcribed:', transcribedText);
      
      await handleVoiceSearch(transcribedText);
      
    } catch (error) {
      console.error('[VoiceSearch] Transcription error:', error);
      alert(language === 'te' 
        ? 'వాయిస్ విఫలమైంది. మళ్లీ ప్రయత్నించండి' 
        : 'Voice search failed. Please try again');
      onProductsFound([], '');
    } finally {
      setIsProcessing(false);
      onVoiceEnd?.();
    }
  };

  const toggleRecording = async () => {
    if (isListening) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleRecording}
      className={`voice-search-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
      disabled={isProcessing}
      aria-label={language === 'te' ? 'వాయిస్ సెర్చ్' : 'Voice Search'}
      title={isListening 
        ? (language === 'te' ? 'మాట్లాడండి... (నిశ్శబ్దం తర్వాత ఆటో-స్టాప్)' : 'Speak... (auto-stops after silence)') 
        : (language === 'te' ? 'మైక్‌ని నొక్కి మాట్లాడండి' : 'Tap mic and speak')}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}
