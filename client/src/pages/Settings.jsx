import React from 'react';
import { Settings as SettingsIcon, Bell, Monitor, Lock, Database } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-4xl font-bold text-gray-100">Preferences</h2>
        <p className="text-gray-400 mt-2 text-lg">Customize your tracker experience.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        
        <div className="card flex items-start space-x-4 cursor-pointer hover:bg-white/[0.04]">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl"><Monitor size={24} /></div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-100">Appearance</h4>
            <p className="text-sm text-gray-400 mt-1">Change theme, layout, and colors.</p>
          </div>
        </div>

        <div className="card flex items-start space-x-4 cursor-pointer hover:bg-white/[0.04]">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Bell size={24} /></div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-100">Notifications</h4>
            <p className="text-sm text-gray-400 mt-1">Manage email and push alerts.</p>
          </div>
        </div>

        <div className="card flex items-start space-x-4 cursor-pointer hover:bg-white/[0.04]">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl"><Lock size={24} /></div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-100">Privacy</h4>
            <p className="text-sm text-gray-400 mt-1">Control who can see your data.</p>
          </div>
        </div>

        <div className="card flex items-start space-x-4 cursor-pointer hover:bg-white/[0.04]">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Database size={24} /></div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-100">Data Export</h4>
            <p className="text-sm text-gray-400 mt-1">Download a copy of your tasks and logs.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
