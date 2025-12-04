import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Platform-agnostic storage solution for redux-persist
 * Handles web and native platforms correctly; falls back to in-memory when necessary
 */
const createStorage = () => {
  // Safe check for browser localStorage
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return {
      getItem: async (key: string): Promise<string | null> => {
        try {
          return Promise.resolve(window.localStorage.getItem(key));
        } catch (error) {
          console.error('[Storage] Error getting item from localStorage:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string): Promise<void> => {
        try {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (error) {
          console.error('[Storage] Error setting item in localStorage:', error);
        }
      },
      removeItem: async (key: string): Promise<void> => {
        try {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        } catch (error) {
          console.error('[Storage] Error removing item from localStorage:', error);
        }
      },
    };
  }

  // On native platforms, use AsyncStorage if available
  if (Platform.OS !== 'web' && AsyncStorage) {
    return AsyncStorage;
  }

  // Fallback: in-memory storage (useful for SSR / test environments / node)
  const memStore: Record<string, string> = {};

  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        return memStore.hasOwnProperty(key) ? memStore[key] : null;
      } catch (error) {
        console.error('[Storage] Error getting item from memory store:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        memStore[key] = value;
        return Promise.resolve();
      } catch (error) {
        console.error('[Storage] Error setting item in memory store:', error);
      }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        delete memStore[key];
        return Promise.resolve();
      } catch (error) {
        console.error('[Storage] Error removing item from memory store:', error);
      }
    },
  };
};

export const storage = createStorage();
