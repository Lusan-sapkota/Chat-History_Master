import React, { useState } from 'react';
import { Message } from '../types/chat';
import { MessageSquare, Search, ChevronLeft, ChevronRight, Download, Filter, Calendar, User } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [senderFilter, setSenderFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const getUniqueSenders = () => {
    const senders = new Set(allMessages.map(msg => msg.From));
    return Array.from(senders);
  };

  const getFilteredMessages = () => {
    let filtered = [...messages];
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(msg => {
        const msgDate = new Date(msg.Date);
        return msgDate.toDateString() === filterDate.toDateString();
      });
    }
    
    if (senderFilter !== 'all') {
      filtered = filtered.filter(msg => msg.From === senderFilter);
    }
    
    // Sort messages
    filtered.sort((a, b) => {
      const dateA = new Date(a.Date).getTime();
      const dateB = new Date(b.Date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return filtered;
  };

  const filteredMessages = getFilteredMessages();

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <MessageSquare size={48} />
        <p className="mt-4 text-lg text-center">Select a user to view their messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{selectedUser}</h2>
              <p className="text-sm text-gray-500">{allMessages.length} messages</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              <span className="text-sm">Filters</span>
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm">Sort {sortOrder === 'asc' ? '↑' : '↓'}</span>
            </button>
            <PDFDownloadLink
              document={<ChatPDFDocument username={selectedUser} messages={allMessages} />}
              fileName={generatePDFFileName(selectedUser)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              <span className="text-sm">Download PDF</span>
            </PDFDownloadLink>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Date Filter
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Sender Filter
                </label>
                <select
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Senders</option>
                  {getUniqueSenders().map(sender => (
                    <option key={sender} value={sender}>{sender}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatStats messages={allMessages} username={selectedUser} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>No messages found matching your criteria</p>
          </div>
        ) : (
          filteredMessages.map((message, index) => (
            <div
              key={index}
              className={`p-3 lg:p-4 rounded-lg shadow-sm transition-all hover:shadow-md ${
                message.From === selectedUser
                  ? 'bg-blue-50 border-l-4 border-blue-400 ml-auto max-w-[85%] lg:max-w-[80%]'
                  : 'bg-gray-50 border-l-4 border-gray-400 mr-auto max-w-[85%] lg:max-w-[80%]'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm text-gray-700">
                  {message.From}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(message.Date)}
                </span>
              </div>
              <p className="text-gray-800 break-words text-sm lg:text-base leading-relaxed">
                {message.Content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t bg-white flex items-center justify-center gap-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default MessageList;