import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Platform, PlatformConfig, UploadedData, RecentUpload } from '../types/chat';

interface UploadInterfaceProps {
  onDataUploaded: (data: UploadedData) => void;
  recentUploads: RecentUpload[];
  onLoadRecent: (id: string) => void;
  onDeleteRecent: (id: string) => void;
}

const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500',
    description: 'Upload WhatsApp chat export JSON',
    supportedFormats: ['.json', '.txt']
  },
  facebook: {
    name: 'Facebook Messenger',
    icon: '💙',
    color: 'bg-blue-500',
    description: 'Upload Facebook Messenger data',
    supportedFormats: ['.json']
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: 'bg-pink-500',
    description: 'Upload Instagram direct messages',
    supportedFormats: ['.json']
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-black',
    description: 'Upload TikTok chat data',
    supportedFormats: ['.json']
  },
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    color: 'bg-blue-400',
    description: 'Upload Telegram chat export',
    supportedFormats: ['.json']
  },
  discord: {
    name: 'Discord',
    icon: '🎮',
    color: 'bg-indigo-500',
    description: 'Upload Discord chat logs',
    supportedFormats: ['.json']
  },
  twitter: {
    name: 'Twitter/X',
    icon: '🐦',
    color: 'bg-gray-800',
    description: 'Upload Twitter DM data',
    supportedFormats: ['.json']
  },
  snapchat: {
    name: 'Snapchat',
    icon: '👻',
    color: 'bg-yellow-400',
    description: 'Upload Snapchat chat data',
    supportedFormats: ['.json']
  },
  other: {
    name: 'Other Platform',
    icon: '📱',
    color: 'bg-gray-500',
    description: 'Upload chat data from other platforms',
    supportedFormats: ['.json', '.txt']
  }
};

const UploadInterface: React.FC<UploadInterfaceProps> = ({
  onDataUploaded,
  recentUploads,
  onLoadRecent,
  onDeleteRecent
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!selectedPlatform) {
      setError('Please select a platform first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const text = await file.text();
      let parsedData: any;

      // Handle different file formats
      if (file.name.endsWith('.txt') || file.type === 'text/plain') {
        // Handle TXT files (mainly for WhatsApp)
        if (selectedPlatform === 'whatsapp') {
          parsedData = { isTextFormat: true, content: text };
        } else {
          setError('TXT format is only supported for WhatsApp exports.');
          setIsUploading(false);
          return;
        }
      } else {
        // Handle JSON files
        try {
          parsedData = JSON.parse(text);
        } catch {
          setError('Invalid JSON file. Please ensure your file is properly formatted.');
          setIsUploading(false);
          return;
        }
      }

      // Transform data based on platform
      const transformedData = await transformPlatformData(parsedData, selectedPlatform);
      
      const uploadedData: UploadedData = {
        id: Date.now().toString(),
        platform: selectedPlatform,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        totalMessages: Object.values(transformedData).flat().length,
        chatHistory: transformedData,
        participants: Object.keys(transformedData).map(key => key.replace(/^Chat History with |:$/g, ''))
      };

      // Save to localStorage for recent uploads
      const existingUploads = JSON.parse(localStorage.getItem('recentUploads') || '[]');
      const recentUpload: RecentUpload = {
        id: uploadedData.id,
        platform: uploadedData.platform,
        fileName: uploadedData.fileName,
        uploadDate: uploadedData.uploadDate,
        totalMessages: uploadedData.totalMessages
      };
      
      existingUploads.unshift(recentUpload);
      if (existingUploads.length > 10) existingUploads.pop(); // Keep only 10 recent uploads
      localStorage.setItem('recentUploads', JSON.stringify(existingUploads));
      localStorage.setItem(`uploadData_${uploadedData.id}`, JSON.stringify(uploadedData));

      onDataUploaded(uploadedData);
    } catch (err) {
      setError('Failed to process file. Please check the format and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const transformPlatformData = async (data: any, platform: Platform): Promise<any> => {
    // This is a simplified transformation - in reality, each platform would have its own parser
    switch (platform) {
      case 'whatsapp':
        return transformWhatsAppData(data);
      case 'facebook':
        return transformFacebookData(data);
      case 'instagram':
        return transformInstagramData(data);
      case 'tiktok':
        return transformTikTokData(data);
      case 'telegram':
        return transformTelegramData(data);
      case 'discord':
        return transformDiscordData(data);
      case 'twitter':
        return transformTwitterData(data);
      case 'snapchat':
        return transformSnapchatData(data);
      default:
        return transformGenericData(data);
    }
  };

  // Platform-specific transformers (improved)
  const transformWhatsAppData = (data: any) => {
    // Handle TXT format (real WhatsApp exports)
    if (data.isTextFormat && data.content) {
      return parseWhatsAppTxt(data.content);
    }
    
    // Handle JSON formats
    if (Array.isArray(data)) {
      // Check if it's an array of chat objects with chat_name/name and messages
      if (data.length > 0 && (data[0].chat_name || data[0].name) && data[0].messages) {
        const result: any = {};
        data.forEach((chat: any) => {
          const chatName = chat.chat_name || chat.name || 'Unknown Contact';
          const messages = (chat.messages || []).map((msg: any) => ({
            Date: msg.timestamp || msg.Date || new Date().toISOString(),
            From: msg.from || msg.From || msg.sender || 'Unknown',
            Content: msg.text || msg.Content || msg.content || '[Media/Attachment]'
          }));
          result[`Chat History with ${chatName}:`] = messages;
        });
        return result;
      } else {
        // Legacy format - array of messages
        const messages = data.map((msg: any) => ({
          Date: msg.timestamp || msg.Date || new Date().toISOString(),
          From: msg.from || msg.From || msg.sender || 'Unknown',
          Content: msg.text || msg.Content || msg.content || '[Media/Attachment]'
        }));
        return { 'Chat History with WhatsApp Contact:': messages };
      }
    } else if ((data.chat_name || data.name) && data.messages) {
      // Single chat object
      const chatName = data.chat_name || data.name || 'WhatsApp Contact';
      const messages = (data.messages || []).map((msg: any) => ({
        Date: msg.timestamp || msg.Date || new Date().toISOString(),
        From: msg.from || msg.From || msg.sender || 'Unknown',
        Content: msg.text || msg.Content || msg.content || '[Media/Attachment]'
      }));
      return { [`Chat History with ${chatName}:`]: messages };
    } else if (data.messages) {
      // Object with messages array
      const messages = (data.messages || []).map((msg: any) => ({
        Date: msg.timestamp || msg.Date || new Date().toISOString(),
        From: msg.from || msg.From || msg.sender || 'Unknown',
        Content: msg.text || msg.Content || msg.content || '[Media/Attachment]'
      }));
      return { 'Chat History with WhatsApp Contact:': messages };
    }
    return data;
  };

  // WhatsApp TXT parser for real exports
  const parseWhatsAppTxt = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const allMessages: any[] = [];
    const contacts = new Set<string>();
    
    // WhatsApp TXT format: [M/D/YY, H:MM:SS AM] Contact Name: Message
    const messageRegex = /\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}:\d{2}\s*[AP]M)\]\s*([^:]+):\s*(.*)/i;
    
    for (const line of lines) {
      // Skip system messages and empty lines
      if (line.includes('***') || !line.trim()) continue;
      
      const match = line.match(messageRegex);
      if (match) {
        const [, date, time, sender, content] = match;
        const from = sender.trim();
        
        // Parse date - handle M/D/YY format from sample
        const [month, day, year] = date.split('/');
        let fullYear = year;
        if (year.length === 2) {
          fullYear = parseInt(year) > 30 ? `19${year}` : `20${year}`;
        }
        
        try {
          // Convert 12-hour to 24-hour format
          const time24 = convertTo24Hour(time.trim());
          const isoDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time24}`).toISOString();
          
          allMessages.push({
            Date: isoDate,
            From: from,
            Content: content.trim() || '[Media/Attachment]'
          });
          
          contacts.add(from);
        } catch (error) {
          console.warn('Failed to parse date:', date, time);
        }
      }
    }
    
    // Create a combined chat with all participants
    if (allMessages.length > 0) {
      const contactList = Array.from(contacts).filter(c => c !== 'You').join(', ') || 'WhatsApp Contact';
      return { [`Chat History with ${contactList}:`]: allMessages };
    }
    
    return {};
  };

  // Helper function to convert 12-hour to 24-hour format
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(/\s*(AM|PM)/i);
    let [hours, minutes, seconds] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    if (modifier?.toUpperCase() === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    
    return `${hours.padStart(2, '0')}:${minutes}:${seconds || '00'}`;
  };

  const transformFacebookData = (data: any) => {
    // Facebook Messenger format transformation
    try {
      // Handle the actual sample format: { participants: ["Name1", "Name2"], messages: [...], title: "Name" }
      if (data.participants && data.messages && Array.isArray(data.messages)) {
        // Get the contact name (not the user's name)
        let contactName = data.title || 'Facebook Contact';
        
        // If participants is an array of strings, find the non-user name
        if (Array.isArray(data.participants)) {
          contactName = data.participants.find((p: string) => 
            p && p !== 'Your Name' && p !== 'You' && p !== 'Lusan Sapkota'
          ) || contactName;
        }
        
        // Transform Facebook messages to our format
        const transformedMessages = data.messages.map((msg: any) => ({
          Date: msg.timestamp_ms ? new Date(msg.timestamp_ms).toISOString() : 
                msg.timestamp || new Date().toISOString(),
          From: msg.sender_name || msg.sender || 'Unknown',
          Content: msg.content || msg.text || '[Media/Attachment]'
        }));
        
        return { [`Chat History with ${contactName}:`]: transformedMessages };
      }
      
      // Handle direct array of messages
      if (Array.isArray(data)) {
        const transformedMessages = data.map((msg: any) => ({
          Date: msg.timestamp_ms ? new Date(msg.timestamp_ms).toISOString() : 
                msg.timestamp || msg.Date || new Date().toISOString(),
          From: msg.sender_name || msg.sender || msg.From || 'Unknown',
          Content: msg.content || msg.text || msg.Content || '[Media/Attachment]'
        }));
        return { 'Chat History with Facebook Contact:': transformedMessages };
      }
      
      return data;
    } catch (error) {
      console.error('Facebook data transformation error:', error);
      return data;
    }
  };

  const transformInstagramData = (data: any) => {
    // Instagram DM format transformation
    try {
      // Handle the actual sample format: { conversation: { title: "with: username", messages: [...] } }
      if (data.conversation && data.conversation.messages) {
        const title = data.conversation.title || 'Instagram Contact';
        // Extract username from "with: username" format
        const contactName = title.includes('with:') ? 
          title.replace('with:', '').trim() : 
          title;
        
        const transformedMessages = data.conversation.messages.map((msg: any) => ({
          Date: msg.timestamp_ms ? new Date(msg.timestamp_ms).toISOString() : 
                msg.timestamp || msg.created_at || new Date().toISOString(),
          From: msg.sender_name || msg.sender || msg.from || 'Unknown',
          Content: msg.content || msg.text || msg.message || '[Media/Attachment]'
        }));
        
        return { [`Chat History with ${contactName}:`]: transformedMessages };
      }
      
      // Handle array of conversations
      if (Array.isArray(data)) {
        const result: any = {};
        data.forEach((conv: any) => {
          // Get contact name from participants (exclude 'user')
          const contactName = conv.participants?.find((p: string) => p !== 'user' && p !== 'you') || 
                             conv.conversation_id || 'Instagram Contact';
          
          const transformedMessages = (conv.messages || []).map((msg: any) => ({
            Date: msg.timestamp || msg.created_at || new Date().toISOString(),
            From: msg.sender || msg.from || 'Unknown',
            Content: msg.content || msg.text || msg.message || '[Media/Attachment]'
          }));
          
          result[`Chat History with ${contactName}:`] = transformedMessages;
        });
        return result;
      }
      
      // Handle direct messages array
      if (data.messages && Array.isArray(data.messages)) {
        const transformedMessages = data.messages.map((msg: any) => ({
          Date: msg.created_at || msg.timestamp || new Date().toISOString(),
          From: msg.sender || msg.from || 'Unknown',
          Content: msg.text || msg.content || msg.message || '[Media/Attachment]'
        }));
        return { 'Chat History with Instagram Contact:': transformedMessages };
      }
      
      return data;
    } catch (error) {
      console.error('Instagram data transformation error:', error);
      return data;
    }
  };

  const transformTikTokData = (data: any) => {
    // TikTok chat format transformation
    if (Array.isArray(data)) {
      // Handle array of chats
      const result: any = {};
      data.forEach((chat: any) => {
        const chatName = chat.chat_name || 'TikTok Contact';
        const transformedMessages = (chat.messages || []).map((msg: any) => ({
          Date: msg.Date || msg.timestamp || new Date().toISOString(),
          From: msg.From || msg.sender || 'Unknown',
          Content: msg.Content || msg.content || msg.text || '[Media/Attachment]'
        }));
        result[`Chat History with ${chatName}:`] = transformedMessages;
      });
      return result;
    } else if (data.DirectMessages) {
      return { 'Chat History with TikTok Contact:': data.DirectMessages };
    } else if (data.messages) {
      const transformedMessages = (data.messages || []).map((msg: any) => ({
        Date: msg.Date || msg.timestamp || new Date().toISOString(),
        From: msg.From || msg.sender || 'Unknown',
        Content: msg.Content || msg.content || msg.text || '[Media/Attachment]'
      }));
      return { 'Chat History with TikTok Contact:': transformedMessages };
    }
    return data;
  };

  const transformTelegramData = (data: any) => {
    // Telegram export format transformation
    try {
      // Handle the actual sample format: { name: "Group Name", type: "group", messages: [...] }
      if (data.name && data.messages && Array.isArray(data.messages)) {
        const chatName = data.name || 'Telegram Contact';
        const transformedMessages = data.messages.map((msg: any) => ({
          Date: msg.date || msg.timestamp || new Date().toISOString(),
          From: msg.from || msg.sender || msg.author || 'Unknown',
          Content: msg.text || msg.content || msg.message || '[Media/Attachment]'
        }));
        return { [`Chat History with ${chatName}:`]: transformedMessages };
      }
      
      // Handle array of chats
      if (Array.isArray(data)) {
        const result: any = {};
        data.forEach((chat: any) => {
          const chatName = chat.chat_name || chat.name || 'Telegram Contact';
          const transformedMessages = (chat.messages || []).map((msg: any) => ({
            Date: msg.Date || msg.date || msg.timestamp || new Date().toISOString(),
            From: msg.From || msg.from || msg.sender || 'Unknown',
            Content: msg.Content || msg.text || msg.content || '[Media/Attachment]'
          }));
          result[`Chat History with ${chatName}:`] = transformedMessages;
        });
        return result;
      }
      
      // Handle direct messages array
      if (data.messages && Array.isArray(data.messages)) {
        const transformedMessages = data.messages.map((msg: any) => ({
          Date: msg.Date || msg.date || msg.timestamp || new Date().toISOString(),
          From: msg.From || msg.from || msg.sender || 'Unknown',
          Content: msg.Content || msg.text || msg.content || '[Media/Attachment]'
        }));
        return { 'Chat History with Telegram Contact:': transformedMessages };
      }
      
      return data;
    } catch (error) {
      console.error('Telegram data transformation error:', error);
      return data;
    }
  };

  const transformDiscordData = (data: any) => {
    // Discord chat log format transformation
    try {
      // Handle the actual sample format: { channel: "general", messages: [...] }
      if (data.channel && data.messages && Array.isArray(data.messages)) {
        const channelName = data.channel || 'Discord Channel';
        const transformedMessages = data.messages.map((msg: any) => ({
          Date: msg.timestamp || msg.date || new Date().toISOString(),
          From: msg.author || msg.sender || msg.from || 'Unknown',
          Content: msg.content || msg.text || msg.message || '[Media/Attachment]'
        }));
        return { [`Chat History with ${channelName}:`]: transformedMessages };
      }
      
      // Handle array of chats
      if (Array.isArray(data)) {
        const result: any = {};
        data.forEach((chat: any) => {
          const chatName = chat.chat_name || chat.channel || 'Discord Contact';
          const transformedMessages = (chat.messages || []).map((msg: any) => ({
            Date: msg.Date || msg.timestamp || msg.date || new Date().toISOString(),
            From: msg.From || msg.author || msg.sender || 'Unknown',
            Content: msg.Content || msg.content || msg.text || '[Media/Attachment]'
          }));
          result[`Chat History with ${chatName}:`] = transformedMessages;
        });
        return result;
      }
      
      // Handle direct messages array
      if (data.messages && Array.isArray(data.messages)) {
        const transformedMessages = data.messages.map((msg: any) => ({
          Date: msg.Date || msg.timestamp || msg.date || new Date().toISOString(),
          From: msg.From || msg.author || msg.sender || 'Unknown',
          Content: msg.Content || msg.content || msg.text || '[Media/Attachment]'
        }));
        return { 'Chat History with Discord Contact:': transformedMessages };
      }
      
      return data;
    } catch (error) {
      console.error('Discord data transformation error:', error);
      return data;
    }
  };

  const transformTwitterData = (data: any) => {
    // Twitter/X DM format transformation
    if (data.dmConversation && data.dmConversation.messages) {
      // Handle X/Twitter DM format
      const conversationId = data.dmConversation.conversationId || 'Twitter Contact';
      const transformedMessages = (data.dmConversation.messages || []).map((msg: any) => ({
        Date: msg.createdAt || msg.timestamp || new Date().toISOString(),
        From: msg.senderId || msg.sender || 'Unknown',
        Content: msg.text || msg.content || '[Media/Attachment]'
      }));
      return { [`Chat History with ${conversationId}:`]: transformedMessages };
    } else if (Array.isArray(data)) {
      // Handle array of chats
      const result: any = {};
      data.forEach((chat: any) => {
        const chatName = chat.chat_name || 'Twitter Contact';
        const transformedMessages = (chat.messages || []).map((msg: any) => ({
          Date: msg.Date || msg.timestamp || new Date().toISOString(),
          From: msg.From || msg.sender || 'Unknown',
          Content: msg.Content || msg.content || msg.text || '[Media/Attachment]'
        }));
        result[`Chat History with ${chatName}:`] = transformedMessages;
      });
      return result;
    } else if (data.messages) {
      const transformedMessages = (data.messages || []).map((msg: any) => ({
        Date: msg.Date || msg.timestamp || new Date().toISOString(),
        From: msg.From || msg.sender || 'Unknown',
        Content: msg.Content || msg.content || msg.text || '[Media/Attachment]'
      }));
      return { 'Chat History with Twitter Contact:': transformedMessages };
    }
    return data;
  };

  const transformSnapchatData = (data: any) => {
    // Snapchat chat format transformation
    if (data.friends && Array.isArray(data.friends)) {
      // Handle Snapchat format with friends array
      const result: any = {};
      data.friends.forEach((friend: any) => {
        const friendName = friend.username || 'Snapchat Contact';
        const transformedMessages = (friend.messages || []).map((msg: any) => ({
          Date: msg.timestamp || new Date().toISOString(),
          From: msg.sender || 'Unknown',
          Content: msg.content || msg.text || '[Media/Attachment]'
        }));
        result[`Chat History with ${friendName}:`] = transformedMessages;
      });
      return result;
    } else if (Array.isArray(data)) {
      // Handle array of chats
      const result: any = {};
      data.forEach((chat: any) => {
        const chatName = chat.chat_name || 'Snapchat Contact';
        const transformedMessages = (chat.messages || []).map((msg: any) => ({
          Date: msg.Date || msg.timestamp || new Date().toISOString(),
          From: msg.From || msg.sender || 'Unknown',
          Content: msg.Content || msg.content || msg.text || '[Media/Attachment]'
        }));
        result[`Chat History with ${chatName}:`] = transformedMessages;
      });
      return result;
    } else if (data.messages) {
      const transformedMessages = (data.messages || []).map((msg: any) => ({
        Date: msg.Date || msg.timestamp || new Date().toISOString(),
        From: msg.From || msg.sender || 'Unknown',
        Content: msg.Content || msg.content || msg.text || '[Media/Attachment]'
      }));
      return { 'Chat History with Snapchat Contact:': transformedMessages };
    }
    return data;
  };

  const transformGenericData = (data: any) => {
    // Generic format - assume it's already in the right format or try to adapt
    return data;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the dropzone itself
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Check file type
      if (file.type === 'application/json' || file.name.endsWith('.json') || file.name.endsWith('.txt')) {
        handleFileSelect(file);
      } else {
        setError('Please upload a JSON or TXT file.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-2 sm:p-3 md:p-4 lg:p-8 overflow-x-hidden w-full">
      <div className="max-w-6xl mx-auto w-full overflow-x-hidden">
        {/* Header with Logo and Branding */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12 overflow-x-hidden">
          <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 w-full">
            {/* Logo */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 w-full max-w-full overflow-x-hidden justify-center">
              <img 
            src="/logo.png" 
            alt="Chatalyze Logo" 
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-transform hover:scale-105 flex-shrink-0"
              />
              <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent leading-tight break-words">
              Chatalyze
            </h1>
            <p className="text-xs sm:text-base md:text-lg lg:text-xl font-medium text-gray-600 -mt-0.5 sm:-mt-1 break-words">
              Chat Analytics Made Simple
            </p>
              </div>
            </div>
            
            {/* Description */}
            <div className="max-w-3xl mx-auto px-2 sm:px-4 overflow-x-hidden">
              <p className="text-sm sm:text-lg md:text-xl text-gray-700 leading-relaxed break-words">
            Transform your chat history into powerful insights. Upload and analyze conversations from 
            <span className="font-semibold text-purple-600"> WhatsApp</span>, 
            <span className="font-semibold text-blue-600"> Facebook</span>, 
            <span className="font-semibold text-pink-600"> Instagram</span>, and more.
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm overflow-x-hidden">
            <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium whitespace-nowrap">📊 Analytics</span>
            <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium whitespace-nowrap">📄 PDF Export</span>
            <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium whitespace-nowrap">🔒 Private & Secure</span>
            <span className="px-2 sm:px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-medium whitespace-nowrap">⚡ Fast Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        {recentUploads.length > 0 && (
          <div className="mb-6 sm:mb-8 md:mb-12 overflow-x-hidden">
            <div className="flex sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent break-words">
                Recent Uploads
              </h2>
              <button
                onClick={() => setShowRecentModal(true)}
                className="px-2 py-1 sm:px-3 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {recentUploads.slice(0, 3).map((upload) => (
                <div
                  key={upload.id}
                  className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-100"
                  onClick={() => onLoadRecent(upload.id)}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="text-2xl sm:text-3xl p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex-shrink-0">
                      {PLATFORM_CONFIGS[upload.platform].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate text-sm sm:text-base">{upload.fileName}</h3>
                      <p className="text-xs sm:text-sm text-purple-600 font-medium">{PLATFORM_CONFIGS[upload.platform].name}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 font-medium">{upload.totalMessages} messages</span>
                    <span className="text-gray-500 truncate ml-2">{formatDate(upload.uploadDate)}</span>
                  </div>
                  <div className="mt-3 w-full bg-purple-100 rounded-full h-1">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1 rounded-full w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Selection */}
        <div className="mb-6 sm:mb-8 md:mb-12 overflow-x-hidden">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent break-words">
            Choose Your Platform
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6 px-1 py-2">
            {(Object.entries(PLATFORM_CONFIGS) as [Platform, PlatformConfig][]).map(([platform, config]) => (
              <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`group p-3 sm:p-4 md:p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.03] w-full ${
              selectedPlatform === platform
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-xl ring-4 ring-purple-200'
                : 'border-gray-200 bg-white/70 backdrop-blur-sm hover:border-purple-300 hover:shadow-lg'
            }`}
              >
            <div className="text-center overflow-hidden">
              <div className={`text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 p-1 sm:p-2 rounded-lg transition-all duration-300 ${
                selectedPlatform === platform 
                  ? 'bg-gradient-to-br from-purple-100 to-indigo-100 transform scale-110' 
                  : 'group-hover:bg-purple-50'
              }`}>
                {config.icon}
              </div>
              <h3 className={`font-semibold mb-1 sm:mb-2 transition-colors text-xs sm:text-sm md:text-base ${
                selectedPlatform === platform ? 'text-purple-700' : 'text-gray-800'
              }`}>
                {config.name}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-tight hidden sm:block overflow-hidden">
                {config.description}
              </p>
              {selectedPlatform === platform && (
                <div className="mt-2 sm:mt-3 w-full bg-purple-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1 rounded-full w-full animate-pulse"></div>
                </div>
              )}
            </div>
              </button>
            ))}
          </div>
        </div>

        {/* File Upload Area */}
        {selectedPlatform && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-10 border border-purple-100">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="text-3xl sm:text-4xl p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex-shrink-0">
                  {PLATFORM_CONFIGS[selectedPlatform].icon}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Upload {PLATFORM_CONFIGS[selectedPlatform].name} Data
                  </h3>
                  <p className="text-gray-600 font-medium text-sm sm:text-base">
                    Supported: {PLATFORM_CONFIGS[selectedPlatform].supportedFormats.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 md:p-12 lg:p-16 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 scale-102'
                  : 'border-purple-300 hover:border-purple-400 hover:bg-purple-25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-4 border-purple-200"></div>
                    <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-t-4 border-purple-600 absolute top-0 left-0"></div>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-gray-700 mt-4 sm:mt-6 mb-1 sm:mb-2">Processing your file...</p>
                  <p className="text-gray-600 text-sm sm:text-base">This may take a moment for large files</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full">
                    <Upload size={32} className="text-purple-600 sm:w-12 sm:h-12" />
                  </div>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                    Drop your file here
                  </h4>
                  <p className="text-gray-600 mb-1 sm:mb-2 text-base sm:text-lg">
                    or click the button below to browse
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                    Maximum file size: 50MB • Secure & Private Processing
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Choose File
                  </button>
                  <div className="mt-4 sm:mt-6 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      🔒 <span>Private</span>
                    </span>
                    <span className="flex items-center gap-1">
                      ⚡ <span>Fast</span>
                    </span>
                    <span className="flex items-center gap-1">
                      🛡️ <span>Secure</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {error && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="text-red-500 text-lg flex-shrink-0">❌</div>
                  <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Uploads Modal */}
        {showRecentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl border border-purple-100">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                    📊
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Recent Uploads
                  </h2>
                </div>
                <button
                  onClick={() => setShowRecentModal(false)}
                  className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] sm:max-h-[calc(85vh-120px)]">
                <div className="grid gap-3 sm:gap-4">
                  {recentUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border border-purple-100 rounded-xl hover:bg-gradient-to-r hover:from-purple-25 hover:to-indigo-25 transition-all duration-200 group gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                        <div className="text-2xl sm:text-3xl p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg group-hover:scale-105 transition-transform flex-shrink-0">
                          {PLATFORM_CONFIGS[upload.platform].icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-1 truncate">{upload.fileName}</h3>
                          <p className="text-purple-600 font-medium mb-1 text-sm sm:text-base">
                            {PLATFORM_CONFIGS[upload.platform].name} • {upload.totalMessages} messages
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">{formatDate(upload.uploadDate)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            onLoadRecent(upload.id);
                            setShowRecentModal(false);
                          }}
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => onDeleteRecent(upload.id)}
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {recentUploads.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No recent uploads</h3>
                    <p className="text-gray-500 text-sm sm:text-base">Your uploaded files will appear here for quick access</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadInterface;
