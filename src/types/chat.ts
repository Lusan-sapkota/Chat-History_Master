export interface Message {
  Date: string;
  From: string;
  Content: string;
  timestamp?: number;
  messageId?: string;
  mediaType?: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
}

export interface ChatHistory {
  [key: string]: Message[];
}

export interface PaginatedMessages {
  messages: Message[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export type Platform = 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'telegram' | 'discord' | 'twitter' | 'snapchat' | 'other';

export interface UploadedData {
  id: string;
  platform: Platform;
  fileName: string;
  uploadDate: string;
  totalMessages: number;
  chatHistory: ChatHistory;
  participants: string[];
}

export interface RecentUpload {
  id: string;
  platform: Platform;
  fileName: string;
  uploadDate: string;
  totalMessages: number;
}

export interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  description: string;
  supportedFormats: string[];
}