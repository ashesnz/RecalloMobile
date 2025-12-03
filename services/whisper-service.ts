import { apiService } from './api';

/**
 * WhisperService now acts as a wrapper around the backend API
 * The backend handles the OpenAI API key securely and processes audio
 */
class WhisperService {
  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      console.log('[Whisper] Starting transcription via backend for:', audioUri);

      // Use the backend API service to transcribe
      const transcript = await apiService.transcribeAudio(audioUri);

      console.log('[Whisper] Transcription successful via backend');
      return transcript;
    } catch (error) {
      console.error('[Whisper] Transcription error:', error);
      throw error;
    }
  }
}

export const whisperService = new WhisperService();

