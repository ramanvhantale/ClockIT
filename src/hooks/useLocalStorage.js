// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

/**
 * Custom hook to sync state with localStorage with error handling.
 * @param {string} key
 * @param {any} initialValue
 * @returns {[any, (value: any | ((val: any) => any)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      let item = window.localStorage.getItem(key);
      if (!item && key.startsWith('clockit_')) {
        const legacyKey = key.replace('clockit_', 'clockvit_');
        item = window.localStorage.getItem(legacyKey);
      }
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
