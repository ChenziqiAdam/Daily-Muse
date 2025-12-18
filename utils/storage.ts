import { QuoteData } from '../types';

const STORAGE_PREFIX = 'daily_muse_card_';
const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const getTodayString = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

export const saveDailyCard = (data: QuoteData) => {
  const key = `${STORAGE_PREFIX}${data.date}_${data.language}`;
  localStorage.setItem(key, JSON.stringify(data));
};

export const getDailyCard = (date: string, language: 'zh' | 'en'): QuoteData | null => {
  const key = `${STORAGE_PREFIX}${date}_${language}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
};

export const saveApiKey = (apiKey: string) => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};
