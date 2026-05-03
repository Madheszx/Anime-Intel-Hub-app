import { GoogleGenAI, Type } from "@google/genai";
import { Anime } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AIRecommendation {
  title: string;
  reason: string;
}

export async function getAIRecommendations(anime: Anime): Promise<AIRecommendation[]> {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    return [];
  }

  const prompt = `Based on the anime "${anime.title_english || anime.title}", which has the following genres: ${anime.genres?.map(g => g.name).join(", ")} and themes: ${anime.themes?.map(t => t.name).join(", ")}. 
  Synopsis: ${anime.synopsis}
  
  Please recommend 6 similar anime titles that a fan of this show would enjoy. For each recommendation, provide a brief reason why it's a good match.
  Return the results as a JSON array of objects with "title" and "reason" fields.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["title", "reason"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
}
