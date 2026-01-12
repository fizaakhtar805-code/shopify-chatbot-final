
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface UserProfile {
  shoeSize?: string;
  fitPreference?: 'narrow' | 'standard' | 'wide';
}

export interface Message {
  role: Role;
  parts: MessagePart[];
  timestamp: Date;
  groundingUrls?: { title: string; uri: string }[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
