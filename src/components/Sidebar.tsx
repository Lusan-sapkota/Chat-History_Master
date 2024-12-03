import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';

interface SidebarProps {
  usernames: string[];
  selectedUser: string | null;
  onSelectUser: (username: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ usernames, selectedUser, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsernames = usernames.filter(username =>
    username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-gray-800 h-screen flex flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 text-white">
          <Users size={24} />
          <h2 className="text-xl font-semibold">Users</h2>
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 pl-10"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 px-2">
          {filteredUsernames.map((username) => (
            <button
              key={username}
              onClick={() => onSelectUser(username)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                selectedUser === username
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {username}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-700 text-gray-400 text-sm">
        {usernames.length} total users
      </div>
    </div>
  );
}

export default Sidebar;