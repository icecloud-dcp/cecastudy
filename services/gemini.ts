
import { GoogleGenAI, Type } from "@google/genai";
import { Pillar, LessonVariation, AudienceQuestion, Language } from "../types";

// Helper to get AI instance safely
const getAI = (apiKey: string) => new GoogleGenAI({ apiKey });

const getLanguageInstruction = (lang: Language) => 
  lang === 'ko' ? "Respond in Korean." : "Respond in English.";

export const generateCoachResponse = async (
  apiKey: string,
  history: { role: string; text: string }[],
  context: string,
  language: Language,
  topic: string | null
): Promise<string> => {
  const ai = getAI(apiKey);
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are the "Topical Authority Coach", a friendly, expert mentor.
    
    Goal: Help the user build a demand-driven content strategy from a single topic using a 3-step funnel:
    1. Generate 30 Broad Pillars.
    2. Drill down into ONE pillar to get 10 Lesson Variations.
    3. Drill down into ONE variation to get 25 Audience Questions.
    
    Current Context: ${context}
    
    Tone: Encouraging, structured, and strategic.
    Keep responses concise (under 150 words). Always guide them to the next step of the funnel.

    IMPORTANT: ${getLanguageInstruction(language)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      })),
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text || (language === 'ko' ? "죄송합니다. 연결에 문제가 발생했습니다." : "I apologize, I'm having trouble connecting. Please try again.");
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return language === 'ko' ? "오류가 발생했습니다." : "I encountered an error. Please check your API key.";
  }
};

export const generatePillars = async (apiKey: string, language: Language, topic: string): Promise<Pillar[]> => {
  const ai = getAI(apiKey);
  const model = "gemini-2.5-flash";

  const prompt = `
    Generate 30 broad, distinct pillar topics for a comprehensive content strategy on: "${topic}".
    These should cover the entire landscape of the niche (Beginner, Intermediate, Advanced, History, Future, Mistakes, Tools, etc.).
    
    IMPORTANT: The values for 'title', 'description', and 'category' MUST be in ${language === 'ko' ? 'Korean' : 'English'}.
    
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING, description: "Category (e.g. Fundamentals, Strategy, Mistakes, Tools)" }
            },
            required: ["id", "title", "description", "category"]
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as Pillar[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Pillars Error:", error);
    return [];
  }
};

export const generateLessonVariations = async (apiKey: string, language: Language, topic: string, pillar: Pillar): Promise<LessonVariation[]> => {
  const ai = getAI(apiKey);
  const model = "gemini-2.5-flash";

  const prompt = `
    Context: Building authority on "${topic}".
    Selected Pillar: "${pillar.title}" (${pillar.description}).
    
    Generate 10 specific "Lesson Variations" or content angles for this specific pillar.
    These should be distinct ways to teach this concept (e.g., specific case study, a how-to guide, a myth-busting session, a checklist, a personal story).
    
    IMPORTANT: The values MUST be in ${language === 'ko' ? 'Korean' : 'English'}.
    
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING, description: "Catchy title for this lesson/content piece" },
              description: { type: Type.STRING },
              angle: { type: Type.STRING, description: "The content angle (e.g. 'Mistake', 'Story', 'Framework')" }
            },
            required: ["id", "title", "description", "angle"]
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as LessonVariation[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Variations Error:", error);
    return [];
  }
};

export const generateAudienceQuestions = async (apiKey: string, language: Language, topic: string, pillar: Pillar, variation: LessonVariation): Promise<AudienceQuestion[]> => {
  const ai = getAI(apiKey);
  const model = "gemini-2.5-flash";

  const prompt = `
    Context: Content Strategy for "${topic}".
    Pillar: "${pillar.title}".
    Specific Lesson/Angle: "${variation.title}" (${variation.description}).
    
    Generate 25 highly relevant, specific audience questions that real people would ask about this specific lesson.
    Focus on pain points, confusion, search intent, and practical application.
    
    IMPORTANT: The values MUST be in ${language === 'ko' ? 'Korean' : 'English'}.
    
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              intent: { type: Type.STRING, description: "User intent (e.g. 'How-to', 'Definition', 'Comparison', 'Troubleshooting')" }
            },
            required: ["id", "question", "intent"]
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AudienceQuestion[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Questions Error:", error);
    return [];
  }
};
