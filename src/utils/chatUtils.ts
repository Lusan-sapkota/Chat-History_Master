import { ChatHistory, Message, PaginatedMessages } from '../types/chat';

export const MESSAGES_PER_PAGE = 20;

export const extractUsernames = (chatHistory: ChatHistory): string[] => {
  const usernames = Object.keys(chatHistory).map(key => {
    // Handle different key formats from different platforms
    if (key.startsWith('Chat History with ')) {
      return key.replace('Chat History with ', '').replace(':', '');
    } else if (key.includes('Contact') || key.includes('User')) {
      return key.replace(/.*with\s+/, '').replace(':', '');
    } else {
      // For direct usernames or other formats
      return key.replace(':', '');
    }
  }).filter(username => username && username.trim() !== '');
  
  return [...new Set(usernames)].sort((a, b) => a.localeCompare(b));
};

export const getMessagesForUser = (
  chatHistory: ChatHistory,
  username: string,
  page: number = 1,
  searchTerm: string = ''
): PaginatedMessages => {
  // Try to find messages with different key formats
  let allMessages: Message[] = [];
  
  // Common key formats from different platforms
  const possibleKeys = [
    `Chat History with ${username}:`,
    `Chat History with ${username}`,
    username,
    `${username}:`,
    `messages_${username}`,
    `conversation_${username}`
  ];
  
  for (const key of possibleKeys) {
    if (chatHistory[key] && Array.isArray(chatHistory[key])) {
      allMessages = chatHistory[key];
      break;
    }
  }
  
  // If no direct match, search through all keys
  if (allMessages.length === 0) {
    for (const [key, messages] of Object.entries(chatHistory)) {
      if (key.toLowerCase().includes(username.toLowerCase()) && Array.isArray(messages)) {
        allMessages = messages;
        break;
      }
    }
  }

  const filteredMessages = searchTerm
    ? allMessages.filter(msg => 
        (msg.Content && msg.Content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (msg.From && msg.From.toLowerCase().includes(searchTerm.toLowerCase()))
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

export const getAllMessagesForUser = (chatHistory: ChatHistory, username: string): Message[] => {
  // Try to find messages with different key formats
  let allMessages: Message[] = [];
  
  // Common key formats from different platforms
  const possibleKeys = [
    `Chat History with ${username}:`,
    `Chat History with ${username}`,
    username,
    `${username}:`,
    `messages_${username}`,
    `conversation_${username}`
  ];
  
  for (const key of possibleKeys) {
    if (chatHistory[key] && Array.isArray(chatHistory[key])) {
      allMessages = chatHistory[key];
      break;
    }
  }
  
  // If no direct match, search through all keys
  if (allMessages.length === 0) {
    for (const [key, messages] of Object.entries(chatHistory)) {
      if (key.toLowerCase().includes(username.toLowerCase()) && Array.isArray(messages)) {
        allMessages = messages;
        break;
      }
    }
  }
  
  return allMessages;
};

export const getUserStats = (chatHistory: ChatHistory, username: string) => {
  const messages = getAllMessagesForUser(chatHistory, username);
  
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      lastActive: null,
      messageCount: 0,
      avgWordsPerMessage: 0
    };
  }
  
  // Sort messages by date to find last active
  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = parseMessageDate(a.Date);
    const dateB = parseMessageDate(b.Date);
    return dateB.getTime() - dateA.getTime();
  });
  
  const lastActive = sortedMessages.length > 0 ? sortedMessages[0].Date : null;
  
  // Calculate average words per message
  const totalWords = messages.reduce((total, msg) => {
    return total + (msg.Content ? msg.Content.split(' ').length : 0);
  }, 0);
  
  const avgWordsPerMessage = messages.length > 0 ? Math.round(totalWords / messages.length) : 0;
  
  return {
    totalMessages: messages.length,
    lastActive,
    messageCount: messages.length,
    avgWordsPerMessage
  };
};

export const formatDate = (dateString: string): string => {
  try {
    // Handle various date formats
    let date: Date;
    
    // Check if it's a timestamp (number as string)
    if (/^\d+$/.test(dateString)) {
      const timestamp = parseInt(dateString);
      // Handle both seconds and milliseconds timestamps
      date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if parsing fails
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return dateString; // Return original string if error occurs
  }
};

export const parseMessageDate = (dateString: string): Date => {
  try {
    // Handle various date formats
    let date: Date;
    
    // Check if it's a timestamp (number as string)
    if (/^\d+$/.test(dateString)) {
      const timestamp = parseInt(dateString);
      // Handle both seconds and milliseconds timestamps
      date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    } else if (dateString.includes('T') || dateString.includes('-')) {
      // ISO format or similar
      date = new Date(dateString);
    } else {
      // Try to parse as is
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Fallback to current date if parsing fails
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.warn('Date parsing error:', error);
    return new Date(); // Return current date if error occurs
  }
};

export const sortUsersByActivity = (chatHistory: ChatHistory, usernames: string[]): string[] => {
  return usernames.sort((a, b) => {
    const statsA = getUserStats(chatHistory, a);
    const statsB = getUserStats(chatHistory, b);
    
    // Sort by last active date (most recent first)
    if (statsA.lastActive && statsB.lastActive) {
      const dateA = parseMessageDate(statsA.lastActive);
      const dateB = parseMessageDate(statsB.lastActive);
      return dateB.getTime() - dateA.getTime();
    }
    
    // If one has no messages, put the one with messages first
    if (statsA.totalMessages > 0 && statsB.totalMessages === 0) return -1;
    if (statsA.totalMessages === 0 && statsB.totalMessages > 0) return 1;
    
    // Sort by total messages as fallback
    return statsB.totalMessages - statsA.totalMessages;
  });
};