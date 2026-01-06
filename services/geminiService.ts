
import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from "../types";

export const generateAnimeWallpaper = async (config: GenerationConfig): Promise<string> => {
  // Fix: Always use the process.env.API_KEY directly for initialization as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // In a real app, you might want to wrap this in a try-catch and handle specific errors
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `High-quality anime style masterpiece wallpaper, vibrant colors, detailed art, professional lighting, centered composition, theme: ${config.prompt}. 4k resolution, smooth textures, eye-catching.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio,
      },
    },
  });

  let imageUrl = '';
  // Fix: Iterate through all parts to find the image part; do not assume it is the first part.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
      break;
    }
  }

  if (!imageUrl) {
    throw new Error('未能生成图片，请重试');
  }

  return imageUrl;
};
