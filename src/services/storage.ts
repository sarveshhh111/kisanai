/**
 * Web-safe storage adapter for zustand/persist.
 * - On web: uses localStorage (synchronous, works perfectly)
 * - On native (iOS/Android): uses AsyncStorage for true offline persistence
 */
import { Platform } from 'react-native';
import { StateStorage } from 'zustand/middleware';

// Lazy-import AsyncStorage only on native to avoid web bundler issues
let NativeStorage: StateStorage | null = null;

if (Platform.OS !== 'web') {
  // Dynamic require to prevent bundling on web
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  NativeStorage = {
    getItem: async (name: string) => {
      const val = await AsyncStorage.getItem(name);
      return val ?? null;
    },
    setItem: async (name: string, value: string) => {
      await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string) => {
      await AsyncStorage.removeItem(name);
    },
  };
}

/**
 * Universal storage: localStorage on web, AsyncStorage on native.
 */
export const kisanStorage: StateStorage = Platform.OS === 'web'
  ? {
      getItem: (name) => {
        try {
          return Promise.resolve(localStorage.getItem(name));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (name, value) => {
        try {
          localStorage.setItem(name, value);
        } catch { /* storage full – fail silently */ }
        return Promise.resolve();
      },
      removeItem: (name) => {
        try {
          localStorage.removeItem(name);
        } catch { /* ignore */ }
        return Promise.resolve();
      },
    }
  : NativeStorage!;
