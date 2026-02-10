import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '../utils/helpers';
import { AppData } from '../types';

const STORAGE_KEY = 'step2save_data';
const SAVE_DELAY = 1000; // 1 second debounce

function loadFromStorage(): AppData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as AppData;
    }
  } catch (e) {
    console.error('Failed to parse saved data:', e);
  }
  return { projects: [], theme: 'pink' };
}

export function useLocalStorage() {
  // 使用同步 lazy initializer 在第一次 render 時直接讀取 localStorage，
  // 避免非同步 load effect 與 App.tsx sync effect 競爭造成資料被空值覆蓋的問題。
  const [data, setData] = useState<AppData>(loadFromStorage);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialMount = useRef(true);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((dataToSave: AppData) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        setIsSaving(false);
      } catch (e) {
        console.error('Failed to save data:', e);
        // Check if localStorage is full
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          alert('儲存空間已滿！請刪除一些照片或匯出資料後清空。');
        }
        setIsSaving(false);
      }
    }, SAVE_DELAY),
    []
  );

  // Save data to localStorage with debounce
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsSaving(true);
    debouncedSave(data);
  }, [data, debouncedSave]);

  return { data, setData, isSaving };
}
