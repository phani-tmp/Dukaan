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
          const { granted } = await SpeechRecognition.checkPermissions();
          if (!granted) {
            await SpeechRecognition.requestPermissions();
          }
        }
      } catch (error) {
        console.error('[Voice] Capacitor availability check failed:', error);
        setIsAvailable(false);
      }
    } else {
      const webSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setIsAvailable(webSupport);
    }
  };

  const startNativeListening = async () => {
    try {
      const lang = language === 'te' ? 'te-IN' : 'en-IN';
      
      await SpeechRecognition.start({
        language: lang,
        maxResults: 1,
        prompt: language === 'te' ? 'మాట్లాడండి...' : 'Speak now...',
        partialResults: false,
        popup: true
      });

      setIsListening(true);

      SpeechRecognition.addListener('partialResults', (data) => {
        console.log('[Voice] Partial results:', data.matches);
      });

      const result = await new Promise((resolve, reject) => {
        SpeechRecognition.addListener('listeningState', (state) => {
          if (state.status === 'stopped') {
            setIsListening(false);
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
        onTranscript(result);
      }
      
      await SpeechRecognition.stop();
      setIsListening(false);
      SpeechRecognition.removeAllListeners();
    } catch (error) {
      console.error('[Voice] Native recognition error:', error);
      setIsListening(false);
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
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('[Voice] Web recognition error:', event.error);
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
        SpeechRecognition.removeAllListeners();
      } catch (error) {
        console.error('[Voice] Stop error:', error);
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
