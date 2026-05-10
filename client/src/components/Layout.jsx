import React from 'react';
import Navbar from './Navbar';
import { LayoutDashboard, CheckSquare, RefreshCw, Heart, BarChart2, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children, setToken }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
    { name: 'Habits', icon: <RefreshCw size={20} />, path: '/habits' },
    { name: 'Hobbies', icon: <Heart size={20} />, path: '/hobbies' },
    { name: 'Analytics', icon: <BarChart2 size={20} />, path: '/analytics' },
    { name: 'Daily Log', icon: <BookOpen size={20} />, path: '/log' },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-gray-100 font-sans overflow-hidden">
      {/* Sidebar - Hidden on Mobile */}
      <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 tracking-tight">
            Tracker
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 font-semibold border border-indigo-500/20 shadow-inner'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar setToken={setToken} />
        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto relative z-10">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Visible only on Small Screens */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-3 z-50 overflow-x-auto no-scrollbar gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-[50px] space-y-1 transition-all ${
                location.pathname === item.path ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={location.pathname === item.path ? 'scale-110 mb-0.5' : 'scale-100 mb-0.5'}>
                {React.cloneElement(item.icon, { size: 18 })}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tighter truncate w-full text-center">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
