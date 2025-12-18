import React, { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Card } from './components/Card';
import { Controls } from './components/Controls';
import { ApiKeyInput } from './components/ApiKeyInput'; // Added import
import { QuoteData, UserPreferences, DEFAULT_PREFERENCES, GenerateStatus } from './types';
import { generateQuoteContent, generateCardImage, updateApiKey } from './services/gemini';
import { getDailyCard, saveDailyCard, getTodayString, getApiKey, saveApiKey } from './utils/storage';

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [status, setStatus] = useState<GenerateStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [apiKey, setApiKey] = useState(getApiKey() || '');

  // Initialize: Load from storage or default
  useEffect(() => {
    const today = getTodayString();
    const storedCard = getDailyCard(today, preferences.language);
    
    if (storedCard) {
      setQuoteData(storedCard);
      setStatus('completed');
    } else {
      handleGenerate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Watch for language change
  useEffect(() => {
    const today = getTodayString();
    const storedCard = getDailyCard(today, preferences.language);
    if (storedCard) {
        setQuoteData(storedCard);
        setStatus('completed');
    } else {
        setQuoteData(null); 
        setStatus('idle');
    }
  }, [preferences.language]);

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    saveApiKey(newApiKey);
    updateApiKey(newApiKey);
  };

  const handleGenerate = useCallback(async (isInitialLoad = false) => {
    if (status.startsWith('generating')) return;

    setStatus('generating_text');
    setErrorMsg(null);

    const prefsToUse = isInitialLoad ? DEFAULT_PREFERENCES : preferences;

    try {
      const content = await generateQuoteContent(prefsToUse);
      setStatus('generating_image');
      const imageUrl = await generateCardImage(content.imagePrompt);

      const newCard: QuoteData = {
        ...content,
        imageUrl,
        date: getTodayString(),
        language: prefsToUse.language,
      };

      setQuoteData(newCard);
      saveDailyCard(newCard);
      setStatus('completed');

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(prefsToUse.language === 'zh' ? "生成失败，请检查您的 API 密钥并重试。" : "Generation failed, please check your API key and try again.");
    }
  }, [preferences, status]);

  const downloadCard = async (share: boolean = false) => {
      const element = document.getElementById('daily-muse-card');
      if (!element) return;
      
      setIsProcessingAction(true);
      try {
          const canvas = await html2canvas(element, {
              scale: 2, 
              useCORS: true,
              backgroundColor: null,
          });

          if (share && navigator.share) {
              canvas.toBlob(async (blob) => {
                  if (blob) {
                      const file = new File([blob], 'daily-muse.png', { type: 'image/png' });
                      try {
                        await navigator.share({
                            title: 'Daily Muse',
                            text: 'My Daily Inspiration Card',
                            files: [file]
                        });
                      } catch (e) {
                          console.log("Share cancelled or failed", e);
                      }
                  }
              });
          } else {
              const link = document.createElement('a');
              link.download = `daily-muse-${getTodayString()}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
          }
      } catch (e) {
          console.error("Capture failed", e);
          setErrorMsg(preferences.language === 'zh' ? "保存图片失败" : "Failed to save image");
      } finally {
          setIsProcessingAction(false);
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      <header className="mb-10 text-center text-stone-700">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 tracking-tight">
            {preferences.language === 'zh' ? "每日 · 灵感" : "Daily Muse"}
        </h1>
        <div className="h-0.5 w-12 bg-stone-300 mx-auto mb-3"></div>
        <p className="font-sans tracking-[0.2em] text-xs text-stone-500 uppercase">
            {preferences.language === 'zh' ? "发现属于你的今日诗意" : "Discover your poetic moment"}
        </p>
      </header>

      {/* API Key Input Component */}
      <ApiKeyInput 
        apiKey={apiKey} 
        onApiKeyChange={handleApiKeyChange} 
        isZh={preferences.language === 'zh'} 
      />

      {/* Main Container - Adjusted to stretch items for equal height */}
      <div className="flex flex-col lg:flex-row lg:items-stretch justify-center gap-8 lg:gap-16 w-full max-w-6xl">
        
        {/* Left Column: The Card + Buttons */}
        <div className="w-full lg:w-[45%] flex flex-col items-center gap-6">
          <div className="w-full flex justify-center lg:justify-end relative">
            {quoteData ? (
                <Card 
                    id="daily-muse-card" 
                    data={quoteData} 
                    loading={status.startsWith('generating')} 
                    layout={preferences.layout}
                />
            ) : (
                <div className="relative w-full max-w-md aspect-[3/4] bg-white border border-stone-200 shadow-sm flex items-center justify-center">
                    <div className="absolute inset-4 border border-dashed border-stone-300 flex items-center justify-center">
                        <div className="text-center p-6 text-stone-400">
                            <p className="font-serif italic text-lg">{status === 'idle' ? (preferences.language === 'zh' ? "准备生成..." : "Ready to create...") : ""}</p>
                            {status.startsWith('generating') && <Card data={{} as any} loading={true} layout={preferences.layout} />}
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* Action Buttons - Minimalist Style */}
          {quoteData && !status.startsWith('generating') && (
              <div className="flex gap-4 w-full max-w-md justify-center lg:justify-end h-12 flex-none">
                  <button 
                    onClick={() => downloadCard(false)}
                    disabled={isProcessingAction}
                    className="flex-1 bg-white border border-stone-300 hover:bg-stone-50 text-stone-600 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 font-medium text-xs uppercase tracking-wider"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      {preferences.language === 'zh' ? "保存卡片" : "Save"}
                  </button>
                  <button 
                    onClick={() => downloadCard(true)}
                    disabled={isProcessingAction}
                    className="flex-1 bg-white border border-stone-300 hover:bg-stone-50 text-stone-600 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 font-medium text-xs uppercase tracking-wider"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                      {preferences.language === 'zh' ? "分享" : "Share"}
                  </button>
              </div>
          )}
          {/* Spacer to balance height if no buttons */}
          {(!quoteData || status.startsWith('generating')) && <div className="h-12 w-full max-w-md flex-none"></div>}
        </div>

        {/* Right Column: Controls - Fills height to match Left Column */}
        <div className="w-full lg:w-[45%] flex flex-col items-center">
            <div className="w-full max-w-md h-full">
                <Controls 
                    preferences={preferences}
                    onUpdate={setPreferences}
                    onGenerate={() => handleGenerate(false)}
                    disabled={status.startsWith('generating')}
                    errorMsg={errorMsg}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;