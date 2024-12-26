import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Menu, X, MessageSquare, BarChart2, Settings as SettingsIcon, LogOut, FileText, Sparkles, Code } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Chat from '../components/dashboard/Chat';
import Analytics from '../components/dashboard/Analytics';
import Documents from '../components/dashboard/Documents';
import IdeaGenerator from '../components/dashboard/IdeaGenerator';
import CodeBuilder from '../components/dashboard/CodeBuilder';
import SettingsPage from '../components/dashboard/Settings';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex">
      <div className={`fixed lg:static lg:flex-shrink-0 w-64 sidebar-blur min-h-screen transition-all duration-300 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">AIFounder</h1>
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8 space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Chat
            </button>
            <button
              onClick={() => navigate('/dashboard/ideas')}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <Sparkles className="h-5 w-5 mr-3" />
              Ideas
            </button>
            <button
              onClick={() => navigate('/dashboard/code-builder')}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <Code className="h-5 w-5 mr-3" />
              Code Builder
            </button>
            <button
              onClick={() => navigate('/dashboard/analytics')}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <BarChart2 className="h-5 w-5 mr-3" />
              Analytics
            </button>
            <button
              onClick={() => navigate('/dashboard/documents')}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <FileText className="h-5 w-5 mr-3" />
              Documents
            </button>
            <button
              onClick={() => navigate('/dashboard/settings')}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <SettingsIcon className="h-5 w-5 mr-3" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors text-red-400"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-1">
        <header className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/30 p-4">
          <button
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/ideas" element={<IdeaGenerator />} />
            <Route path="/code-builder" element={<CodeBuilder />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;