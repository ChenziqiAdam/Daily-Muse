export interface QuoteData {
  quote: string;
  author: string;
  source: string;
  imagePrompt: string;
  imageUrl?: string;
  date: string; // YYYY-MM-DD
  language: 'zh' | 'en';
}

export type CardLayout = 'classic' | 'polaroid' | 'cinematic' | 'magazine';
export type ArtStyle = 'realistic' | 'anime' | 'painting' | 'illustration';

export interface UserPreferences {
  mood: number;    // 1-4
  weather: number; // 1-4
  luck: number;    // 1-4
  language: 'zh' | 'en';
  layout: CardLayout;
  artStyle: ArtStyle;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  mood: 3,
  weather: 3,
  luck: 3,
  language: 'en',
  layout: 'classic',
  artStyle: 'realistic',
};

export type GenerateStatus = 'idle' | 'generating_text' | 'generating_image' | 'completed' | 'error';
