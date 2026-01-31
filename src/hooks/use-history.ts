'use client';

import { useState, useEffect, useCallback } from 'react';

const HISTORY_STORAGE_KEY = 'quickpaste_history';
const MAX_HISTORY_ITEMS = 5;

export interface HistoryItem {
  text: string;
  code: string;
  timestamp: number;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load history from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'timestamp'>) => {
    setHistory(prevHistory => {
      const newHistory = [{ ...item, timestamp: Date.now() }, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save history to localStorage', error);
      }
      return newHistory;
    });
  }, []);
  
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history from localStorage', error);
    }
  }, []);

  return { history, addHistoryItem, clearHistory, isLoaded };
}
