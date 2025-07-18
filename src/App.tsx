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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 w-full">
          <UploadInterface
            onDataUploaded={handleDataUploaded}
            recentUploads={recentUploads}
            onLoadRecent={handleLoadRecent}
            onDeleteRecent={handleDeleteRecent}
          />
          <div className="mt-8 flex flex-col items-center">
            <a
              href="https://github.com/Lusan-sapkota/chat-history-analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 text-lg font-semibold bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all duration-200"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.804 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              GitHub Here
            </a>
            <span className="mt-2 text-sm text-gray-600">View source, report issues, or contribute!</span>
          </div>
        </div>
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