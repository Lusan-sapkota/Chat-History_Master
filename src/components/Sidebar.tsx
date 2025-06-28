import React, { useState } from 'react';
import { Users, Search, X, ArrowLeft, MessageCircle, Clock, SortAsc, SortDesc } from 'lucide-react';
import { getUserStats, sortUsersByActivity, formatDate } from '../utils/chatUtils';
import { ChatHistory } from '../types/chat';

interface SidebarProps {
  usernames: string[];
  selectedUser: string | null;
  onSelectUser: (username: string) => void;
  onGoBack?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  showBackButton?: boolean;
  chatHistory?: ChatHistory;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  usernames, 
  selectedUser, 
  onSelectUser, 
  onGoBack,
  isOpen = true, 
  onToggle,
  showBackButton = false,
  chatHistory = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showBackModal, setShowBackModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'messages'>('activity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getSortedUsernames = () => {
    let sorted = [...usernames];
    
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.localeCompare(b));
    } else if (sortBy === 'activity') {
      sorted = sortUsersByActivity(chatHistory, usernames);
    } else if (sortBy === 'messages') {
      sorted.sort((a, b) => {
        const statsA = getUserStats(chatHistory, a);
        const statsB = getUserStats(chatHistory, b);
        return statsB.totalMessages - statsA.totalMessages;
      });
    }
    
    if (sortOrder === 'asc') {
      sorted.reverse();
    }
    
    return sorted;
  };

  const filteredUsernames = getSortedUsernames().filter(username =>
    username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackClick = () => {
    setShowBackModal(true);
  };

  const confirmBack = () => {
    setShowBackModal(false);
    if (onGoBack) {
      onGoBack();
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
      return `${Math.floor(diffDays / 365)}y ago`;
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 lg:w-80
        bg-white dark:bg-gray-900 h-screen flex flex-col transition-transform duration-300 ease-in-out
        border-r border-gray-200 dark:border-gray-700 shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-medium">Back to Upload</span>
                </button>
              ) : (
                <>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Contacts</h2>
                    <p className="text-sm text-blue-100">Chat History</p>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-white/70 rounded-lg px-4 py-2 pl-10 focus:bg-white/30 focus:outline-none backdrop-blur-sm"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-white/70" />
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-1 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {sortOrder === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
              {sortOrder === 'desc' ? 'Desc' : 'Asc'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['activity', 'messages', 'name'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-2 text-xs rounded-md font-medium transition-colors ${
                  sortBy === option
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {option === 'activity' ? 'Activity' : option === 'messages' ? 'Messages' : 'Name'}
              </button>
            ))}
          </div>
          
          {/* Stats */}
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <span>{filteredUsernames.length} of {usernames.length} contacts</span>
            <span>{usernames.reduce((total, username) => total + getUserStats(chatHistory, username).totalMessages, 0)} total messages</span>
          </div>
        </div>
        
        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredUsernames.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users size={32} className="opacity-50" />
                </div>
                <p className="text-sm font-medium mb-1">No contacts found</p>
                <p className="text-xs text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsernames.map((username) => {
                  const stats = getUserStats(chatHistory, username);
                  const isSelected = selectedUser === username;
                  
                  return (
                    <button
                      key={username}
                      onClick={() => {
                        onSelectUser(username);
                        if (onToggle && window.innerWidth < 1024) {
                          onToggle(); // Close sidebar on mobile after selection
                        }
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 group relative ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md'
                      }`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                          isSelected ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {username.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium truncate pr-2">{username}</span>
                            {stats.lastActive && (
                              <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                                {getTimeAgo(stats.lastActive)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <MessageCircle size={12} className={isSelected ? 'text-white/70' : 'text-gray-400'} />
                                <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {stats.totalMessages.toLocaleString()}
                                </span>
                              </div>
                              {stats.lastActive && (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} className={isSelected ? 'text-white/70' : 'text-gray-400'} />
                                  <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {formatDate(stats.lastActive).split(',')[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Activity indicator */}
                            <div className={`w-2 h-2 rounded-full ${
                              stats.totalMessages > 0 
                                ? isSelected ? 'bg-white' : 'bg-green-400' 
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Chatalyze - Chat History Analyzer
            </div>
            <div className="text-xs text-gray-400">
              v1.0 • Multi-Platform Support
            </div>
          </div>
        </div>
      </div>

      {/* Go Back Confirmation Modal */}
      {showBackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeft size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Return to Upload Interface?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                You'll lose your current chat analysis session and return to the upload screen to select new data.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBackModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmBack}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
