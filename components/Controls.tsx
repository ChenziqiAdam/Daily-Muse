import React, { useState } from 'react';
import { UserPreferences, CardLayout, ArtStyle } from '../types';

interface ControlsProps {
  preferences: UserPreferences;
  onUpdate: (newPrefs: UserPreferences) => void;
  onGenerate: () => void;
  disabled?: boolean;
  errorMsg?: string | null;
}

// Minimalist Numeric Selector Component
const ScoreSelector: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
}> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-xs text-stone-400 font-bold uppercase tracking-widest block text-center border-b border-stone-100 pb-1 mb-2">
        {label}
    </label>
    <div className="flex gap-2">
      {[1, 2, 3, 4].map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`flex-1 py-2 text-sm font-serif border transition-all duration-300 ${
            value === num
              ? 'bg-stone-700 border-stone-700 text-stone-50 shadow-sm'
              : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  </div>
);

const OptionButton: React.FC<{
    selected: boolean;
    label: string;
    onClick: () => void;
}> = ({ selected, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2 text-[11px] sm:text-xs font-medium border transition-all duration-300 ${
            selected
            ? 'bg-stone-700 border-stone-700 text-stone-50 shadow-sm'
            : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'
        }`}
    >
        {label}
    </button>
)

export const Controls: React.FC<ControlsProps> = ({ preferences, onUpdate, onGenerate, disabled, errorMsg, apiKey, onApiKeyChange }) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  const updateField = (field: keyof UserPreferences, value: any) => {
    onUpdate({ ...preferences, [field]: value });
  };

  const handleSaveApiKey = () => {
    onApiKeyChange(localApiKey);
  };

  const isZh = preferences.language === 'zh';

  return (
    <div className="bg-white p-6 md:p-8 shadow-sm border border-stone-200 w-full h-full flex flex-col">

      {/* Top: Language Toggle */}
      <div className="flex-none flex justify-center border-b border-stone-200 pb-2">
        <button
          onClick={() => updateField('language', 'zh')}
          className={`px-4 pb-2 text-xs font-medium transition-all relative top-[9px] ${
            preferences.language === 'zh'
              ? 'text-stone-800 border-b-2 border-stone-800'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          中文
        </button>
        <button
          onClick={() => updateField('language', 'en')}
          className={`px-4 pb-2 text-xs font-medium transition-all relative top-[9px] ${
            preferences.language === 'en'
              ? 'text-stone-800 border-b-2 border-stone-800'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          English
        </button>
      </div>



      {/* Middle: Controls Grouped (Flex-1 to take available space) */}
      <div className="flex-1 flex flex-col justify-center space-y-6 py-8">
        {/* Numeric Score Selectors */}
        <div className="space-y-4">
            <ScoreSelector
            label={isZh ? "心情 (Mood)" : "Mood"}
            value={preferences.mood}
            onChange={(v) => updateField('mood', v)}
            />
            <ScoreSelector
            label={isZh ? "天气 (Weather)" : "Weather"}
            value={preferences.weather}
            onChange={(v) => updateField('weather', v)}
            />
            <ScoreSelector
            label={isZh ? "运气 (Luck)" : "Luck"}
            value={preferences.luck}
            onChange={(v) => updateField('luck', v)}
            />
        </div>

        <div className="grid grid-cols-1 gap-4">
            {/* Art Style Selector */}
            <div className="space-y-2">
                <label className="text-xs text-stone-400 font-bold uppercase tracking-widest block text-center border-b border-stone-100 pb-1 mb-2">
                    {isZh ? "画风 · Style" : "Art Style"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <OptionButton selected={preferences.artStyle === 'realistic'} label={isZh ? "写实" : "Realistic"} onClick={() => updateField('artStyle', 'realistic')} />
                    <OptionButton selected={preferences.artStyle === 'anime'} label={isZh ? "动漫" : "Anime"} onClick={() => updateField('artStyle', 'anime')} />
                    <OptionButton selected={preferences.artStyle === 'painting'} label={isZh ? "油画" : "Painting"} onClick={() => updateField('artStyle', 'painting')} />
                    <OptionButton selected={preferences.artStyle === 'illustration'} label={isZh ? "插画" : "Illustration"} onClick={() => updateField('artStyle', 'illustration')} />
                </div>
            </div>

            {/* Layout Selector */}
            <div className="space-y-2">
                <label className="text-xs text-stone-400 font-bold uppercase tracking-widest block text-center border-b border-stone-100 pb-1 mb-2">
                    {isZh ? "排版 · Layout" : "Layout"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <OptionButton selected={preferences.layout === 'classic'} label={isZh ? "经典" : "Classic"} onClick={() => updateField('layout', 'classic')} />
                    <OptionButton selected={preferences.layout === 'polaroid'} label={isZh ? "拍立得" : "Polaroid"} onClick={() => updateField('layout', 'polaroid')} />
                    <OptionButton selected={preferences.layout === 'cinematic'} label={isZh ? "电影感" : "Cinema"} onClick={() => updateField('layout', 'cinematic')} />
                    <OptionButton selected={preferences.layout === 'magazine'} label={isZh ? "杂志风" : "Magazine"} onClick={() => updateField('layout', 'magazine')} />
                </div>
            </div>
        </div>
      </div>

      {/* Bottom: Action Button & Status */}
      <div className="flex-none space-y-4">
        <button
            onClick={onGenerate}
            disabled={disabled}
            className={`w-full py-4 px-6 text-white font-medium text-sm tracking-widest uppercase transition-all duration-300
            ${disabled 
                ? 'bg-stone-300 cursor-not-allowed' 
                : 'bg-stone-800 hover:bg-stone-700 shadow-sm hover:shadow-md'
            }`}
        >
            {disabled 
            ? (isZh ? "灵感采集中..." : "Inking...") 
            : (isZh ? "生成今日卡片" : "Reveal Daily Muse")}
        </button>

        <div className="min-h-[1rem] flex items-center justify-center">
            {errorMsg ? (
                <div className="text-red-700 text-xs text-center">
                    {errorMsg}
                </div>
            ) : (
                <div className="text-[10px] text-stone-400 text-center tracking-wide">
                    {isZh ? "✨ AI 生成内容仅供参考" : "✨ AI generated content"}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};