import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@pantiss_erp:';

export const storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_PREFIX + key);
      if (value === null) return defaultValue;
      return JSON.parse(value) as T;
    } catch (e) {
      console.warn(`[storage] Error reading key "${key}":`, e);
      return defaultValue;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[storage] Error setting key "${key}":`, e);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (e) {
      console.warn(`[storage] Error removing key "${key}":`, e);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pantissKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
      if (pantissKeys.length > 0) {
        await AsyncStorage.multiRemove(pantissKeys);
      }
      return true;
    } catch (e) {
      console.warn('[storage] Error clearing storage:', e);
      return false;
    }
  },
};
