import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Role, Message, UserProfile } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async sendMessage(history: Message[], prompt: string, imageBase64?: string, profile?: UserProfile): Promise<Message> {
    const contents = history.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(p => {
        if (p.text) return { text: p.text };
        if (p.inlineData) return { inlineData: p.inlineData };
        return { text: '' };
      })
    }));

    const userParts: any[] = [{ text: prompt }];
    if (imageBase64) {
      userParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    contents.push({
      role: Role.USER,
      parts: userParts
    });

    const profileContext = profile && (profile.shoeSize || profile.fitPreference) 
      ? `USER PROFILE CONTEXT: The user typically wears size ${profile.shoeSize || 'unspecified'} and prefers a ${profile.fitPreference || 'standard'} fit. Use this to provide tailored sizing advice.`
      : "USER PROFILE CONTEXT: No specific sizing profile provided yet.";

    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: `You are the Efashion AI Stylist (efashion.com.pk), a luxury footwear consultant specializing in artisan shoes.

        ${profileContext}

        STRICT RESPONSE RULES:
        1. **Engaging Descriptions**: When describing products, focus on exquisite materials (e.g., premium calfskin, supple suede, hand-woven textiles) and artisan craftsmanship (e.g., Blake-stitched soles, hand-burnished finishes, ergonomic silhouettes).
        2. **Sizing Specialist**: If a user profile is provided, use it to suggest whether specific shoe styles (like narrow-toe heels or wide-base loafers) would be suitable for them.
        3. **Sophistication**: Maintain an elite, editorial tone. Use evocative language like "sculpted silhouette," "tonal refinement," or "unrivaled comfort."
        4. **Brevity with Substance**: While descriptions should be engaging and detailed, keep the overall response to 2-3 impactful sentences.
        5. **Raw Links**: If providing a link, output ONLY the raw URL as plain text (e.g., https://efashion.com.pk/products/luxury-loafer). 
           - ABSOLUTELY NO Markdown links.
           - NO clickable text.
        6. **Selective Linking**: Only provide a link if explicitly requested.
        7. **Context**: Focus strictly on SHOES. Highlight how the design and materials elevate the wearer's ensemble.`,
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "I am here to assist with your footwear curation.";
    
    return {
      role: Role.MODEL,
      parts: [{ text }],
      timestamp: new Date()
    };
  }
}

export const geminiService = new GeminiService();

