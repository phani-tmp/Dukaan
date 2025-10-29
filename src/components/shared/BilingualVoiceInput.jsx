import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { translateText } from '../../services/gemini';

const BilingualVoiceInput = ({ onTranscript, className = '' }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'te-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
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

    recognition.onerror = (event) => {
      console.error('[BilingualVoiceInput] Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

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
