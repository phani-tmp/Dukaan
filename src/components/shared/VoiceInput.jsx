import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export default function VoiceInput({ onTranscript, language = 'en', className = '' }) {
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
        console.error('[VoiceInput] Availability check failed:', error);
        setIsAvailable(false);
      }
    } else {
      const webSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setIsAvailable(webSupport);
    }
  };

  const startNativeListening = async () => {
    let resultReceived = false;
    
    const handleResult = async (data) => {
      if (resultReceived) return;
      resultReceived = true;
      
      if (data.matches && data.matches.length > 0) {
        onTranscript(data.matches[0]);
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
        console.error('[VoiceInput] Cleanup error:', e);
      }
    };

    try {
      await SpeechRecognition.removeAllListeners();
      
      await SpeechRecognition.addListener('listeningState', handleStateChange);
      await SpeechRecognition.addListener('finalResults', handleResult);

      const lang = language === 'te' ? 'te-IN' : 'en-IN';
      
      setIsListening(true);

      await SpeechRecognition.start({
        language: lang,
        maxResults: 5,
        prompt: language === 'te' ? 'మాట్లాడండి...' : 'Speak now...',
        partialResults: false,
        popup: true
      });

    } catch (error) {
      console.error('[VoiceInput] Error:', error);
      setIsListening(false);
      await cleanup();
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
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('[VoiceInput] Web recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = async () => {
    if (isNative) {
      try {
        await SpeechRecognition.stop();
        await SpeechRecognition.removeAllListeners();
      } catch (error) {
        console.error('[VoiceInput] Stop error:', error);
      }
    }
    setIsListening(false);
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
      type="button"
      onClick={toggleListening}
      className={`voice-input-btn ${isListening ? 'listening' : ''} ${className}`}
      aria-label={language === 'te' ? 'వాయిస్ ఇన్‌పుట్' : 'Voice Input'}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}
