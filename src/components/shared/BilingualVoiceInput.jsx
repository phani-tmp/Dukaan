import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { AudioRecorder } from '../../utils/audioRecorder';
import { transcribeAudio, translateText } from '../../services/gemini';

const BilingualVoiceInput = ({ onTranscript, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recorder] = useState(() => new AudioRecorder());

  useEffect(() => {
    setIsSupported(AudioRecorder.isSupported());
  }, []);

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

  const startRecording = async () => {
    try {
      await recorder.startRecording();
      setIsListening(true);
    } catch (error) {
      console.error('[BilingualVoiceInput] Recording error:', error);
      
      if (error.message === 'FEATURE_NOT_SUPPORTED') {
        alert('Voice recording is not supported on your device\nవాయిస్ రికార్డింగ్ మీ పరికరంలో మద్దతు లేదు');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Please allow microphone access\nమైక్రోఫోన్ యాక్సెస్ అనుమతించండి');
      } else {
        alert('Failed to start voice recording\nవాయిస్ రికార్డింగ్ ప్రారంభించడం విఫలమైంది');
      }
    }
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await recorder.stopRecording();
      const audioBase64 = await recorder.blobToBase64(audioBlob);
      
      const transcribedText = await transcribeAudio(audioBase64, audioBlob.type);
      await handleTranscript(transcribedText);
      
    } catch (error) {
      console.error('[BilingualVoiceInput] Transcription error:', error);
      alert('Voice input failed. Please try again\nవాయిస్ విఫలమైంది. మళ్లీ ప్రయత్నించండి');
    } finally {
      setIsListening(false);
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
      type="button"
      onClick={toggleRecording}
      className={`voice-input-btn ${isListening ? 'listening' : ''} ${className}`}
      title={isListening 
        ? 'Tap to stop recording' 
        : 'Tap and speak (auto-translates to both languages)'}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
};

export default BilingualVoiceInput;
