export interface Message {
  Date: string;
  From: string;
  Content: string;
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