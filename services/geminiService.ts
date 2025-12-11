import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AspectRatio } from "../types";

// Determine API key from common env locations. When missing, we avoid constructing the client
// and return safe mock responses so the app can run locally without a Gemini key.
const API_KEY = process.env.GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY || process.env.API_KEY;
const hasApiKey = Boolean(API_KEY);
let ai: GoogleGenAI | null = null;
if (hasApiKey) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  // eslint-disable-next-line no-console
  console.warn("GEMINI API key not found. AI features will return mock data.");
}

/**
 * Handles complex fitness queries using the Thinking model (gemini-3-pro-preview).
 * Uses a high thinking budget for deep reasoning.
 */
export const askFitnessCoach = async (prompt: string, useThinking: boolean = true): Promise<string> => {
  // If API key missing, return a safe, helpful mock so UI doesn't break.
  if (!hasApiKey) {
    return `Mock Coach: I can't access the AI service here. General advice: prioritize progressive overload, maintain good form, track volume, and recover with 7-9 hours sleep.`;
  }

  try {
    const config: any = {
      systemInstruction: "You are an elite, professional fitness coach. Provide precise, scientific, and motivating advice. Use a natural, encouraging, and concise tone.",
    };

    if (useThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget for deep reasoning
    }

    const response = await ai!.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: config
    });

    return (response as any).text || "I'm not sure about that. Could you clarify?";
  } catch (error) {
    console.error("Coach Error:", error);
    return "I'm having trouble connecting right now. Please try again.";
  }
};

/**
 * Handles general app support queries.
 */
export const askSupportAgent = async (prompt: string): Promise<string> => {
  if (!hasApiKey) {
    return `Mock Support: This is a demo response. For help, open the Coach tab, log a workout in Log Workout, or check Profile > Help.`;
  }

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the helpful Support Assistant for NeoFit, a premium fitness application. Your goal is to help users understand how to use the app features like Logging Workouts, checking the Coach tab, using the Nutrition tracker, and interacting with the Social community. Keep answers concise, friendly, and easy to follow.",
      }
    });
    return (response as any).text || "I'm here to help, but I didn't catch that.";
  } catch (error) {
    console.error("Support Agent Error:", error);
    return "I'm having trouble connecting to the support database.";
  }
};

/**
 * Analyzes images (meals, equipment) using gemini-3-pro-preview.
 */
export const analyzeImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  if (!hasApiKey) {
    return "Mock Vision: Image analysis disabled in local mode.";
  }

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      }
    });

    return (response as any).text || "Analysis complete. No details found.";
  } catch (error) {
    console.error("Vision Error:", error);
    return "Could not analyze the image.";
  }
};

/**
 * Analyzes video content (form check, exercise demo) using gemini-3-pro-preview.
 */
export const analyzeVideo = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  if (!hasApiKey) {
    return "Mock Video: Video analysis unavailable in local mode.";
  }

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: `Analyze this fitness video. ${prompt}` }
        ]
      },
      config: { 
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 0 } 
      } 
    });

    return (response as any).text || "Video processing complete.";
  } catch (error) {
    console.error("Video Error:", error);
    return "Video processing currently unavailable.";
  }
};

/**
 * Generates images (goal visualization) using gemini-3-pro-image-preview.
 */
export const generateFitnessImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
  if (!hasApiKey) {
    return null; // No image generation available in local/mock mode
  }

  try {
    const response = await ai!.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    for (const part of (response as any).candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};