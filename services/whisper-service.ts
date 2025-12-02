import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

interface WhisperResponse {
  text: string;
}

class WhisperService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set. Please set it in your user profile.');
    }

    try {
      console.log('[Whisper] Starting transcription for:', audioUri);

      // Read the audio file
      const audioInfo = await FileSystem.getInfoAsync(audioUri);
      if (!audioInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      // Create form data for the API request
      const formData = new FormData();

      // Determine the correct MIME type based on the file extension
      const fileExtension = audioUri.split('.').pop()?.toLowerCase();
      let mimeType = 'audio/m4a'; // Default for iOS

      if (fileExtension === 'wav') {
        mimeType = 'audio/wav';
      } else if (fileExtension === 'mp3') {
        mimeType = 'audio/mpeg';
      } else if (fileExtension === 'webm') {
        mimeType = 'audio/webm';
      }

      // For React Native, we need to create a blob-like object
      const file = {
        uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
        type: mimeType,
        name: `recording.${fileExtension || 'm4a'}`,
      } as any;

      formData.append('file', file);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Optional: specify language

      console.log('[Whisper] Sending request to OpenAI...');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Whisper] API error:', errorText);
        throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
      }

      const data: WhisperResponse = await response.json();
      console.log('[Whisper] Transcription successful:', data.text);

      return data.text;
    } catch (error) {
      console.error('[Whisper] Transcription error:', error);
      throw error;
    }
  }
}

export const whisperService = new WhisperService();

