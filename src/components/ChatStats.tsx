import React from 'react';
import { BarChart2, MessageCircle, Clock } from 'lucide-react';
import { Message } from '../types/chat';

interface ChatStatsProps {
  messages: Message[];
  username: string;
}

const ChatStats: React.FC<ChatStatsProps> = ({ messages, username }) => {
  const totalMessages = messages.length;
  const userMessages = messages.filter(m => m.From === username).length;
  const otherMessages = totalMessages - userMessages;
  
  const lastMessageDate = messages.length > 0 
    ? new Date(messages[messages.length - 1].Date)
    : null;

  const daysSinceLastMessage = lastMessageDate
    ? Math.floor((new Date().getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
      <div className="flex items-center space-x-2">
        <MessageCircle size={20} className="text-blue-500" />
        <div>
          <p className="text-sm font-medium text-gray-600">Messages</p>
          <p className="text-lg font-semibold">{totalMessages}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <BarChart2 size={20} className="text-green-500" />
        <div>
          <p className="text-sm font-medium text-gray-600">Ratio</p>
          <p className="text-lg font-semibold">{userMessages}/{otherMessages}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Clock size={20} className="text-purple-500" />
        <div>
          <p className="text-sm font-medium text-gray-600">Last Active</p>
          <p className="text-lg font-semibold">
            {daysSinceLastMessage !== null 
              ? `${daysSinceLastMessage}d ago` 
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatStats;