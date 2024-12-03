import { ChatHistory, Message, PaginatedMessages } from '../types/chat';

export const MESSAGES_PER_PAGE = 20;

export const extractUsernames = (chatHistory: ChatHistory): string[] => {
  return Object.keys(chatHistory)
    .map(key => key.replace('Chat History with ', '').replace(':', ''))
    .sort((a, b) => a.localeCompare(b));
};

export const getMessagesForUser = (
  chatHistory: ChatHistory,
  username: string,
  page: number = 1,
  searchTerm: string = ''
): PaginatedMessages => {
  const key = `Chat History with ${username}:`;
  const allMessages = chatHistory[key] || [];
  
  const filteredMessages = searchTerm
    ? allMessages.filter(msg => 
        msg.Content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.From.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allMessages;

  const totalCount = filteredMessages.length;
  const totalPages = Math.ceil(totalCount / MESSAGES_PER_PAGE);
  const startIndex = (page - 1) * MESSAGES_PER_PAGE;
  
  const paginatedMessages = filteredMessages
    .slice(startIndex, startIndex + MESSAGES_PER_PAGE);

  return {
    messages: paginatedMessages,
    totalCount,
    currentPage: page,
    totalPages
  };
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};