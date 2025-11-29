import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Platform-agnostic storage solution for redux-persist
 * Handles web and native platforms correctly
 */
const createStorage = () => {
  // On web, ensure we're using the browser's localStorage
  if (Platform.OS === 'web') {
    return {
      getItem: async (key: string): Promise<string | null> => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('[Storage] Error getting item:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string): Promise<void> => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('[Storage] Error setting item:', error);
        }
      },
      removeItem: async (key: string): Promise<void> => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('[Storage] Error removing item:', error);
        }
      },
    };
  }

  // On native platforms, use AsyncStorage
  return AsyncStorage;
};

export const storage = createStorage();

