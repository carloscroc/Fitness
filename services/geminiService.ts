import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AspectRatio } from "../types";

// Initialize the client. 
// Note: In a real app, you might want to lazily init this or handle missing keys more gracefully.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Handles complex fitness queries using the Thinking model (gemini-3-pro-preview).
 * Uses a high thinking budget for deep reasoning.
 */
export const askFitnessCoach = async (prompt: string, useThinking: boolean = true): Promise<string> => {
  try {
    const config: any = {
      systemInstruction: "You are an elite, professional fitness coach. Provide precise, scientific, and motivating advice. Use a natural, encouraging, and concise tone.",
    };

    if (useThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget for deep reasoning
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: config
    });

    return response.text || "I'm not sure about that. Could you clarify?";
  } catch (error) {
    console.error("Coach Error:", error);
    return "I'm having trouble connecting right now. Please try again.";
  }
};

/**
 * Handles general app support queries.
 */
export const askSupportAgent = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: {
        systemInstruction: "You are the helpful Support Assistant for NeoFit, a premium fitness application. Your goal is to help users understand how to use the app features like Logging Workouts, checking the Coach tab, using the Nutrition tracker, and interacting with the Social community. Keep answers concise, friendly, and easy to follow.",
      }
    });
    return response.text || "I'm here to help, but I didn't catch that.";
  } catch (error) {
    console.error("Support Agent Error:", error);
    return "I'm having trouble connecting to the support database.";
  }
};

/**
 * Analyzes images (meals, equipment) using gemini-3-pro-preview.
 */
export const analyzeImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
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

    return response.text || "Analysis complete. No details found.";
  } catch (error) {
    console.error("Vision Error:", error);
    return "Could not analyze the image.";
  }
};

/**
 * Analyzes video content (form check, exercise demo) using gemini-3-pro-preview.
 */
export const analyzeVideo = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
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

    return response.text || "Video processing complete.";
  } catch (error) {
    console.error("Video Error:", error);
    return "Video processing currently unavailable.";
  }
};

/**
 * Generates images (goal visualization) using gemini-3-pro-image-preview.
 */
export const generateFitnessImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
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

    for (const part of response.candidates?.[0]?.content?.parts || []) {
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