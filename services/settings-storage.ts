import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionSettings } from '@/types/project';

const QUESTION_SETTINGS_KEY = 'question_settings';

export const settingsStorage = {
  async saveSettings(settings: QuestionSettings): Promise<void> {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(QUESTION_SETTINGS_KEY, jsonValue);
      console.log('[SettingsStorage] Settings saved:', settings);
    } catch (error) {
      console.error('[SettingsStorage] Error saving settings:', error);
      throw error;
    }
  },

  async getSettings(): Promise<QuestionSettings | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(QUESTION_SETTINGS_KEY);
      if (jsonValue != null) {
        const settings = JSON.parse(jsonValue);
        console.log('[SettingsStorage] Settings loaded:', settings);
        return settings;
      }
      console.log('[SettingsStorage] No settings found');
      return null;
    } catch (error) {
      console.error('[SettingsStorage] Error loading settings:', error);
      return null;
    }
  },

  async clearSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUESTION_SETTINGS_KEY);
      console.log('[SettingsStorage] Settings cleared');
    } catch (error) {
      console.error('[SettingsStorage] Error clearing settings:', error);
      throw error;
    }
  },
};

