import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { translateText } from '../../services/gemini';

const BilingualVoiceInput = ({ onTranscript, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
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
          const { speechRecognition } = await SpeechRecognition.checkPermissions();
          if (speechRecognition !== 'granted') {
            await SpeechRecognition.requestPermissions();
          }
        }
      } catch (error) {
        console.error('[BilingualVoice] Availability check failed:', error);
        setIsAvailable(false);
      }
    } else {
      const webSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setIsAvailable(webSupport);
    }
  };

  const handleTranscript = async (transcript) => {
    console.log('[BilingualVoiceInput] Recognized:', transcript);

    try {
      const englishText = await translateText(transcript, 'English');
      const teluguText = await translateText(transcript, 'Telugu');
      
      console.log('[BilingualVoiceInput] Translated EN:', englishText, 'TE:', teluguText);
      
      onTranscript({
        english: englishText || '',
        telugu: teluguText || '',
        original: transcript || ''
      });
    } catch (error) {
      console.error('[BilingualVoiceInput] Translation error:', error);
      onTranscript({
        english: transcript || '',
        telugu: transcript || '',
        original: transcript || ''
      });
    }
  };

  const startNativeListening = async () => {
    let resultReceived = false;
    
    const handleResult = async (data) => {
      if (resultReceived) return;
      resultReceived = true;
      
      if (data.matches && data.matches.length > 0) {
        await handleTranscript(data.matches[0]);
      }
      setIsListening(false);
      await cleanup();
    };

    const handleStateChange = (state) => {
      if (state.status === 'stopped' && !resultReceived) {
        setIsListening(false);
        cleanup();
      }
    };

    const cleanup = async () => {
      try {
        await SpeechRecognition.removeAllListeners();
      } catch (e) {
        console.error('[BilingualVoice] Cleanup error:', e);
      }
    };

    try {
      await SpeechRecognition.removeAllListeners();
      
      await SpeechRecognition.addListener('listeningState', handleStateChange);
      await SpeechRecognition.addListener('finalResults', handleResult);

      setIsListening(true);

      await SpeechRecognition.start({
        language: 'te-IN',
        maxResults: 5,
        prompt: 'మాట్లాడండి...',
        partialResults: false,
        popup: true
      });

    } catch (error) {
      console.error('[BilingualVoice] Error:', error);
      setIsListening(false);
      await cleanup();
    }
  };

  const startWebListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.lang = 'te-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      await handleTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('[BilingualVoice] Web recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const startListening = async () => {
    if (isNative) {
      await startNativeListening();
    } else {
      await startWebListening();
    }
  };

  if (!isAvailable) return null;

  return (
    <button
      type="button"
      onClick={startListening}
      className={`voice-input-btn ${isListening ? 'listening' : ''} ${className}`}
      title="Click to speak (auto-translates to both languages)"
    >
      <Mic className="w-4 h-4" />
    </button>
  );
};

export default BilingualVoiceInput;
