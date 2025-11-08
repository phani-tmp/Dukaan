import { Capacitor } from '@capacitor/core';

// Dynamically import Capacitor plugin only when needed
let VoiceRecorder = null;
const loadVoiceRecorder = async () => {
  if (!VoiceRecorder && Capacitor.isNativePlatform()) {
    const module = await import('capacitor-voice-recorder');
    VoiceRecorder = module.VoiceRecorder;
  }
  return VoiceRecorder;
};

export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.actualMimeType = null;
    this.isNative = Capacitor.isNativePlatform();
    this.nativeRecording = null;
  }

  static isSupported() {
    // On native platforms, always return true if plugin is available
    if (Capacitor.isNativePlatform()) {
      return true;
    }
    // On web, check for MediaRecorder support
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  async startRecording() {
    try {
      if (!AudioRecorder.isSupported()) {
        throw new Error('FEATURE_NOT_SUPPORTED');
      }

      // Use native Capacitor plugin on iOS/Android
      if (this.isNative) {
        const recorder = await loadVoiceRecorder();
        if (!recorder) {
          throw new Error('Voice recorder plugin not available');
        }

        // Check and request permission
        const hasPermission = await recorder.hasAudioRecordingPermission();
        if (!hasPermission.value) {
          const requestResult = await recorder.requestAudioRecordingPermission();
          if (!requestResult.value) {
            throw { name: 'NotAllowedError', message: 'Microphone permission denied' };
          }
        }

        // Start recording with native plugin
        await recorder.startRecording();
        console.log('[AudioRecorder] Native recording started');
        return true;
      }

      // Fallback to web MediaRecorder API
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      this.audioChunks = [];
      
      let mimeType = null;
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const options = mimeType ? { mimeType } : {};
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.actualMimeType = this.mediaRecorder.mimeType || mimeType || 'audio/webm';

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      console.log('[AudioRecorder] Web recording started with mimeType:', this.actualMimeType);
      return true;
    } catch (error) {
      console.error('[AudioRecorder] Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    // Use native Capacitor plugin on iOS/Android
    if (this.isNative) {
      const recorder = await loadVoiceRecorder();
      if (!recorder) {
        throw new Error('Voice recorder plugin not available');
      }

      const result = await recorder.stopRecording();
      
      if (!result.value || !result.value.recordDataBase64) {
        throw new Error('No recording data received');
      }

      console.log('[AudioRecorder] Native recording stopped, duration:', result.value.msDuration, 'ms');
      
      // Convert base64 to Blob for consistency with web API
      const base64Data = result.value.recordDataBase64;
      const mimeType = result.value.mimeType || 'audio/aac';
      
      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: mimeType });
      this.actualMimeType = mimeType;
      
      return audioBlob;
    }

    // Fallback to web MediaRecorder API
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: this.actualMimeType });
          
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }

          console.log('[AudioRecorder] Web recording stopped, blob size:', audioBlob.size, 'type:', this.actualMimeType);
          resolve(audioBlob);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  async cancel() {
    if (this.isNative) {
      const recorder = await loadVoiceRecorder();
      if (recorder) {
        // Native plugin doesn't have explicit cancel, just stop
        try {
          await recorder.stopRecording();
        } catch (error) {
          console.log('[AudioRecorder] Cancel error (may already be stopped):', error);
        }
      }
      return;
    }

    // Web API cancel
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }

  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
