import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { AudioRecorder } from '../../utils/audioRecorder';
import { transcribeAudio } from '../../services/gemini';

export default function VoiceInput({ onTranscript, language = 'en', className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recorder] = useState(() => new AudioRecorder());

  useEffect(() => {
    setIsSupported(AudioRecorder.isSupported());
  }, []);

  const startRecording = async () => {
    try {
      await recorder.startRecording();
      setIsListening(true);
    } catch (error) {
      console.error('[VoiceInput] Recording error:', error);
      
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
      const audioBlob = await recorder.stopRecording();
      const audioBase64 = await recorder.blobToBase64(audioBlob);
      
      const transcribedText = await transcribeAudio(audioBase64, audioBlob.type);
      onTranscript(transcribedText);
      
    } catch (error) {
      console.error('[VoiceInput] Transcription error:', error);
      alert(language === 'te' 
        ? 'వాయిస్ విఫలమైంది. మళ్లీ ప్రయత్నించండి' 
        : 'Voice input failed. Please try again');
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
      aria-label={language === 'te' ? 'వాయిస్ ఇన్‌పుట్' : 'Voice Input'}
      title={isListening 
        ? (language === 'te' ? 'ఆపండి' : 'Tap to stop') 
        : (language === 'te' ? 'మాట్లాడండి' : 'Tap and speak')}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}
