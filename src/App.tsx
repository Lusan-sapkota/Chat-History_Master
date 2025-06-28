import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import UploadInterface from './components/UploadInterface';
import ErrorBoundary from './components/ErrorBoundary';
import { ChatHistory, UploadedData, RecentUpload } from './types/chat';
import { extractUsernames, getMessagesForUser, getAllMessagesForUser } from './utils/chatUtils';
import { Menu } from 'lucide-react';

type AppState = 'upload' | 'chat';

function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load recent uploads from localStorage on component mount
  useEffect(() => {
    const savedUploads = localStorage.getItem('recentUploads');
    if (savedUploads) {
      setRecentUploads(JSON.parse(savedUploads));
    }
  }, []);

  const handleDataUploaded = (data: UploadedData) => {
    setChatHistory(data.chatHistory);
    setAppState('chat');
    setSelectedUser(null);
    setCurrentPage(1);
    setSearchTerm('');
    
    // Update recent uploads
    const updatedUploads = [
      {
        id: data.id,
        platform: data.platform,
        fileName: data.fileName,
        uploadDate: data.uploadDate,
        totalMessages: data.totalMessages
      },
      ...recentUploads.filter(upload => upload.id !== data.id)
    ].slice(0, 10);
    
    setRecentUploads(updatedUploads);
  };

  const handleLoadRecent = (id: string) => {
    const savedData = localStorage.getItem(`uploadData_${id}`);
    if (savedData) {
      const data: UploadedData = JSON.parse(savedData);
      handleDataUploaded(data);
    }
  };

  const handleDeleteRecent = (id: string) => {
    const updatedUploads = recentUploads.filter(upload => upload.id !== id);
    setRecentUploads(updatedUploads);
    localStorage.setItem('recentUploads', JSON.stringify(updatedUploads));
    localStorage.removeItem(`uploadData_${id}`);
  };

  const handleUserSelect = (username: string) => {
    setSelectedUser(username);
    setCurrentPage(1);
    setSearchTerm('');
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleGoBack = () => {
    setAppState('upload');
    setSelectedUser(null);
    setChatHistory({});
  };

  const usernames = extractUsernames(chatHistory);
  const paginatedMessages = selectedUser
    ? getMessagesForUser(chatHistory, selectedUser, currentPage, searchTerm)
    : { messages: [], totalCount: 0, currentPage: 1, totalPages: 1 };

  const allMessages = selectedUser
    ? getAllMessagesForUser(chatHistory, selectedUser)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center text-red-500 max-w-md mx-auto p-6">
          <p className="text-lg font-medium mb-2">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setAppState('upload');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (appState === 'upload') {
    return (
      <ErrorBoundary>
        <UploadInterface
          onDataUploaded={handleDataUploaded}
          recentUploads={recentUploads}
          onLoadRecent={handleLoadRecent}
          onDeleteRecent={handleDeleteRecent}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-100 overflow-hidden w-full max-w-full">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-60 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
        >
          <Menu size={20} />
        </button>

        <Sidebar
          usernames={usernames}
          selectedUser={selectedUser}
          onSelectUser={handleUserSelect}
          onGoBack={handleGoBack}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          showBackButton={true}
          chatHistory={chatHistory}
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