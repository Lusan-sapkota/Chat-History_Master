import React, { useState } from 'react';
import { Message } from '../types/chat';
import { MessageSquare, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { formatDate } from '../utils/chatUtils';
import { generatePDFFileName } from '../utils/pdfUtils';
import ChatStats from './ChatStats';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ChatPDFDocument from './PDFDocument';

interface MessageListProps {
  messages: Message[];
  selectedUser: string | null;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSearch: (term: string) => void;
  allMessages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedUser,
  totalPages,
  currentPage,
  onPageChange,
  onSearch,
  allMessages,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <MessageSquare size={48} />
        <p className="mt-4 text-lg">Select a user to view their messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Messages from {selectedUser}</h2>
          <PDFDownloadLink
            document={<ChatPDFDocument username={selectedUser} messages={allMessages} />}
            fileName={generatePDFFileName(selectedUser)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {({ loading }) => (
              <>
                <Download size={20} />
                {loading ? 'Generating PDF...' : 'Download PDF'}
              </>
            )}
          </PDFDownloadLink>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 border rounded-lg"
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <ChatStats messages={allMessages} username={selectedUser} />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-sm ${
              message.From === selectedUser
                ? 'bg-blue-50 ml-auto max-w-[80%]'
                : 'bg-gray-50 mr-auto max-w-[80%]'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm text-gray-600">
                {message.From}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(message.Date)}
              </span>
            </div>
            <p className="text-gray-800 break-words">{message.Content}</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-center gap-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default MessageList;