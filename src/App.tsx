import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import ErrorBoundary from './components/ErrorBoundary';
import { ChatHistory } from './types/chat';
import { extractUsernames, getMessagesForUser } from './utils/chatUtils';

function App() {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChatData = async () => {
      try {
        const response = await fetch('/src/data/chatData.json');
        if (!response.ok) {
          throw new Error('Failed to load chat data');
        }
        const data = await response.json();
        setChatHistory(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading chat data');
        setLoading(false);
      }
    };

    loadChatData();
  }, []);

  const handleUserSelect = (username: string) => {
    setSelectedUser(username);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const usernames = extractUsernames(chatHistory);
  const paginatedMessages = selectedUser
    ? getMessagesForUser(chatHistory, selectedUser, currentPage, searchTerm)
    : { messages: [], totalCount: 0, currentPage: 1, totalPages: 1 };

  const allMessages = selectedUser
    ? chatHistory[`Chat History with ${selectedUser}:`] || []
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-100">
        <Sidebar
          usernames={usernames}
          selectedUser={selectedUser}
          onSelectUser={handleUserSelect}
        />
        <main className="flex-1 overflow-hidden">
          <MessageList
            messages={paginatedMessages.messages}
            allMessages={allMessages}
            selectedUser={selectedUser}
            totalPages={paginatedMessages.totalPages}
            currentPage={paginatedMessages.currentPage}
            onPageChange={setCurrentPage}
            onSearch={handleSearch}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;