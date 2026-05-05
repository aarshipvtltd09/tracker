import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, LogOut, Target, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../utils/api';

const Profile = ({ setToken }) => {
  const [user, setUser] = useState({ name: 'User', email: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loadingGoals, setLoadingGoals] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/goals`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals');
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setLoadingGoals(true);
    try {
      const res = await fetch(`${API_URL}/api/goals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: newGoal })
      });
      if (res.ok) {
        setNewGoal('');
        fetchGoals();
      }
    } catch (err) {
      console.error('Failed to add goal');
    } finally {
      setLoadingGoals(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/goals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/update-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setTimeout(() => setShowPasswordModal(false), 2000);
      } else {
        setPasswordError(data.message);
      }
    } catch (err) {
      setPasswordError('Failed to update password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setToken) setToken(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-4xl font-bold text-gray-100">My Profile</h2>
        <p className="text-gray-400 mt-2 text-lg">Manage your account and goals.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card space-y-8">
            <div className="flex items-center space-x-6 border-b border-white/5 pb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-4xl font-black shadow-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                <p className="text-gray-400 flex items-center mt-1"><Mail size={16} className="mr-2" /> {user.email}</p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h4 className="text-lg font-bold text-gray-200 flex items-center"><Shield size={20} className="mr-2 text-indigo-400" /> Account Security</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Full Name</label>
                  <input type="text" value={user.name} readOnly className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-300" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email Address</label>
                  <input type="email" value={user.email} readOnly className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-300" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  <Key size={18} className="mr-2" /> Change Password
                </button>
                <button onClick={handleLogout} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-all">
                  <LogOut size={18} className="mr-2" /> Logout Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: My Goals */}
        <div className="space-y-6">
          <div className="card h-fit">
            <h4 className="text-xl font-bold text-white flex items-center mb-6">
              <Target size={22} className="mr-3 text-indigo-400" /> My Goals
            </h4>
            
            <form onSubmit={handleAddGoal} className="relative mb-6">
              <input 
                type="text" 
                placeholder="New Goal..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loadingGoals}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Plus size={18} />
              </button>
            </form>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {goals.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4 italic">No goals set yet.</p>
              ) : (
                goals.map(goal => (
                  <div key={goal._id} className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all">
                    <span className="text-sm text-gray-300 truncate pr-2">{goal.title}</span>
                    <button 
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="card w-full max-w-md border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Key size={20} className="mr-3 text-indigo-400" /> Change Password
            </h3>
            
            {passwordError && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs mb-4">{passwordError}</div>}
            {passwordSuccess && <div className="bg-green-500/10 text-green-400 p-3 rounded-xl text-xs mb-4">{passwordSuccess}</div>}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password</label>
                <input 
                  type="password" 
                  required
                  minLength="6"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">Update Password</button>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

