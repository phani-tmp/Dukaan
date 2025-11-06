import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { AudioRecorder } from '../../utils/audioRecorder';
import { transcribeAudio, translateText } from '../../services/gemini';

const BilingualVoiceInput = ({ onTranscript, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [recorder] = useState(() => new AudioRecorder());

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
      alert('Please allow microphone access');
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
      alert('Voice input failed. Please try again');
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
