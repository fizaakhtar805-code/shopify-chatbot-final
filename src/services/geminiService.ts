import { GoogleGenerativeAI } from "@google/genai";
import { Role, Message, UserProfile } from "../types";

// The model name must be correct
const MODEL_NAME = 'gemini-1.5-pro'; 

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // VITE requires 'import.meta.env' to see your Vercel variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async sendMessage(history: Message[], prompt: string, imageBase64?: string, profile?: UserProfile): Promise<Message> {
    const model = this.genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        systemInstruction: "You are the Efashion AI Stylist (efashion.com.pk). Focus on luxury footwear and artisan craftsmanship."
    });

    // Formatting history for the Gemini API
    const chatHistory = history.map(msg => ({
      role: msg.role === Role.MODEL ? 'model' : 'user',
      parts: msg.parts.map(p => {
        if (p.text) return { text: p.text };
        if (p.inlineData) return { inlineData: p.inlineData };
        return { text: '' };
      })
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const userParts: any[] = [{ text: prompt }];
    if (imageBase64) {
      userParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    try {
      const result = await chat.sendMessage(userParts);
      const response = await result.response;
      const text = response.text();
      
      return {
        role: Role.MODEL,
        parts: [{ text }],
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
