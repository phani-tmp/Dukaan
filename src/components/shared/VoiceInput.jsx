import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onTranscript, language = 'en', className = '' }) {
  const [isListening, setIsListening] = useState(false);
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
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('[Voice] Recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscript]);

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
      type="button"
      onClick={toggleListening}
      className={`voice-input-btn ${isListening ? 'listening' : ''} ${className}`}
      aria-label={language === 'te' ? 'వాయిస్ ఇన్‌పుట్' : 'Voice Input'}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}
