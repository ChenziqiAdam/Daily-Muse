import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  isZh: boolean; // Prop to indicate Chinese language
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange, isZh }) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);

  const handleSaveApiKey = () => {
    onApiKeyChange(localApiKey);
    setIsEditing(false); // Close input after saving
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="bg-stone-700 text-white p-2 rounded-full shadow-lg hover:bg-stone-600 transition-colors"
          title={isZh ? "设置 API 密钥" : "Set API Key"}
        >
          🔑
        </button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-stone-200 flex flex-col space-y-2">
          <label className="text-xs text-stone-400 font-bold uppercase tracking-widest block">
            {isZh ? "Gemini API 密钥" : "Gemini API Key"}
          </label>
          <input
            type="password"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
            className="p-2 text-sm border border-stone-200 rounded-md"
            placeholder={isZh ? "在此输入您的 API 密钥" : "Enter your API key here"}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="py-1 px-3 text-xs font-medium text-stone-500 hover:text-stone-700"
            >
              {isZh ? "取消" : "Cancel"}
            </button>
            <button
              onClick={handleSaveApiKey}
              className="py-1 px-3 text-xs font-medium bg-stone-700 text-white rounded-md hover:bg-stone-600"
            >
              {isZh ? "保存" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
