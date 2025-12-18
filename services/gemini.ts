import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, QuoteData } from "../types";
import { getApiKey } from "../utils/storage";

let apiKey = getApiKey() || '';
let ai = new GoogleGenAI({ apiKey });

export const updateApiKey = (newApiKey: string) => {
  apiKey = newApiKey;
  ai = new GoogleGenAI({ apiKey });
};

const TEXT_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-2.5-flash-image";

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    quote: { type: Type.STRING, description: "The quote text." },
    author: { type: Type.STRING, description: "Author of the quote." },
    source: { type: Type.STRING, description: "Source work (book, movie, song) or context." },
    imagePrompt: { type: Type.STRING, description: "A detailed visual description for an AI image generator to create a matching scene." },
  },
  required: ["quote", "author", "source", "imagePrompt"],
};

export const generateQuoteContent = async (prefs: UserPreferences): Promise<Omit<QuoteData, 'imageUrl' | 'date'>> => {
  const langPrompt = prefs.language === 'zh' ? 'Chinese (Simplified)' : 'English';
  
  const styleKeywords = {
    realistic: "Photorealistic, cinematic lighting, 8k resolution, raw photography style",
    anime: "Anime style, Makoto Shinkai inspired, vibrant colors, detailed clouds, 2D animation style",
    painting: "Oil painting style, textured brushstrokes, impressionist, artistic composition",
    illustration: "Digital illustration, clean lines, flat design, vector art style, artistic"
  };

  const selectedStyle = styleKeywords[prefs.artStyle] || styleKeywords.realistic;

  const systemInstruction = `
    You are an artistic curator of daily inspiration, dedicated to the belief that beautiful words have the strength to heal and uplift.
    Your task is to select a profound quote based on the user's daily parameters (Mood, Weather, Luck) and Language.
    
    SOURCE GUIDELINES:
    - Prioritize quotes with high literary value, poetic beauty, or deep philosophical insight.
    - Select from: classic literature, modern philosophy, iconic movie dialogues, meaningful song lyrics, or poetry.
    - Avoid generic motivational slogans; seek words that resonate with the human condition.
    - You may occasionally generate an original, profound aphorism if it fits the mood perfectly.
    - Ensure the 'author' is correctly attributed. If unknown, use 'Unknown'.
    - Use the 'source' field to indicate the book, movie, song, or 'Original' if applicable.

    Parameters Scale (1-4):
    1: Negative/Low (Sad, Stormy, Bad Luck) -> Comforting, resilient, soothing, or reflective quotes.
    4: Positive/High (Happy, Sunny, Good Luck) -> Uplifting, energetic, romantic, or celebratory quotes.
    
    CRITICAL IMAGE PROMPT INSTRUCTIONS:
    - The user has explicitly selected the visual style: "${prefs.artStyle}".
    - The "imagePrompt" you generate MUST STRICTLY describe an image in this specific style: ${selectedStyle}.
    - Do not mix styles. If "Anime" is selected, the prompt must start with "Anime style illustration of...".
    - The image content should metaphorically or literally match the quote.
    - DO NOT include any text, words, or letters in the image prompt description. The image must be purely visual.
    
    Return valid JSON.
  `;

  const userPrompt = `
    Generate a daily quote card content.
    Language: ${langPrompt}
    Mood: ${prefs.mood}/4
    Weather: ${prefs.weather}/4
    Luck: ${prefs.luck}/4
    Art Style: ${prefs.artStyle}
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response from Gemini");

    const parsed = JSON.parse(text);
    
    return {
      quote: parsed.quote,
      author: parsed.author,
      source: parsed.source,
      imagePrompt: parsed.imagePrompt,
      language: prefs.language,
    };
  } catch (error) {
    console.error("Error generating quote content:", error);
    throw error;
  }
};

export const generateCardImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: prompt }]
      },
    });

    let base64Image = '';
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
        throw new Error("No image data returned");
    }

    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};