import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ setToken }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [user, setUser] = useState({ name: 'User', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setToken) setToken(null);
  };

  return (
    <header className="h-20 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 z-50 relative">
      <div className="relative w-full max-w-md group hidden sm:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-gray-200 placeholder-gray-500 transition-all"
        />
      </div>

      <div className="md:hidden">
        <h1 className="text-2xl font-black text-indigo-500 italic">T</h1>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-6 relative">
        <div className="relative">
          <button 
            onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-black animate-pulse"></span>
          </button>
          
          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-72 bg-black border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-white/5">
                <h3 className="font-bold text-gray-100">Notifications</h3>
              </div>
              <div className="p-4 text-xs text-gray-400">
                <p className="mb-3">Welcome to Tracker!</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex items-center space-x-3 sm:pl-6 sm:border-l border-white/10">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-semibold text-gray-200">{user.name}</p>
          </div>
          <button 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold shadow-lg hover:scale-105 transition-transform"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>

          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-white/5 mb-2">
                <p className="text-sm font-bold text-gray-100">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <button 
                onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center transition-colors"
              >
                <UserIcon size={16} className="mr-3" /> Profile
              </button>
              <button 
                onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center transition-colors"
              >
                <Settings size={16} className="mr-3" /> Settings
              </button>
              <div className="h-px bg-white/5 my-2"></div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors"
              >
                <LogOut size={16} className="mr-3" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
