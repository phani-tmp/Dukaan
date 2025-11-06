import React, { useState } from 'react';
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
  const [recorder] = useState(() => new AudioRecorder());

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
      await recorder.startRecording();
      setIsListening(true);
      onVoiceStart?.();
    } catch (error) {
      console.error('[VoiceSearch] Recording error:', error);
      alert(language === 'te' 
        ? 'మైక్రోఫోన్ యాక్సెస్ అనుమతించండి' 
        : 'Please allow microphone access');
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

  return (
    <button
      onClick={toggleRecording}
      className={`voice-search-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
      disabled={isProcessing}
      aria-label={language === 'te' ? 'వాయిస్ సెర్చ్' : 'Voice Search'}
      title={isListening 
        ? (language === 'te' ? 'ఆపండి' : 'Tap to stop') 
        : (language === 'te' ? 'వెతకండి' : 'Tap and speak')}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}
