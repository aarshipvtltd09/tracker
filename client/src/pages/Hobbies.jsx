import React, { useState, useEffect } from 'react';
import { Heart, Plus, Timer, History, Trash2 } from 'lucide-react';
import { API_URL } from '../utils/api';

const Hobbies = () => {
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHobby, setNewHobby] = useState({ name: '', timeSpent: 0 });
  const [manualTime, setManualTime] = useState({});

  useEffect(() => {
    const cachedHobbies = localStorage.getItem('hobbies_cache');
    if (cachedHobbies) {
      setHobbies(JSON.parse(cachedHobbies));
      setLoading(false);
    }
    fetchHobbies(false);
  }, []);

  const fetchHobbies = async (showLoading = true) => {
    if (showLoading && !localStorage.getItem('hobbies_cache')) {
      setLoading(true);
    }
    try {
      const res = await fetch(`${API_URL}/api/hobbies`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHobbies(data);
        localStorage.setItem('hobbies_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error fetching hobbies:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTime = async (id) => {
    const timeToAdd = parseInt(manualTime[id] || 30);
    
    // Optimistic Update
    const updatedHobbies = hobbies.map(h => 
      h._id === id ? { ...h, timeSpent: (h.timeSpent || 0) + timeToAdd, lastPracticed: new Date().toISOString() } : h
    );
    setHobbies(updatedHobbies);
    localStorage.setItem('hobbies_cache', JSON.stringify(updatedHobbies));
    setManualTime({ ...manualTime, [id]: '' });

    try {
      const res = await fetch(`${API_URL}/api/hobbies/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ timeSpent: timeToAdd })
      });
      if (!res.ok) {
        fetchHobbies(false); // revert
      }
    } catch (error) {
      console.error("Error adding time:", error);
      fetchHobbies(false);
    }
  };

  const addHobby = async () => {
    if (!newHobby.name.trim()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("Session expired. Please login again.");

      const res = await fetch(`${API_URL}/api/hobbies`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newHobby)
      });
      if (res.ok) {
        const hobby = await res.json();
        const updatedHobbies = [...hobbies, hobby];
        setHobbies(updatedHobbies);
        localStorage.setItem('hobbies_cache', JSON.stringify(updatedHobbies));
        setNewHobby({ name: '', timeSpent: 0 });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding hobby:", error);
    }
  };

  const formatLastPracticed = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const deleteHobby = async (id) => {
    const filteredHobbies = hobbies.filter(h => h._id !== id);
    setHobbies(filteredHobbies);
    localStorage.setItem('hobbies_cache', JSON.stringify(filteredHobbies));

    try {
      const res = await fetch(`${API_URL}/api/hobbies/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) fetchHobbies(false);
    } catch (error) {
      console.error("Error deleting hobby:", error);
      fetchHobbies(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-100">Hobby Tracker</h2>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Track your passions and skill growth.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          <span>Add Hobby</span>
        </button>
      </div>

      {loading && hobbies.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {hobbies.map(hobby => (
            <div key={hobby._id} className="card group relative overflow-hidden p-4 sm:p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2.5 sm:p-3 bg-red-500/10 text-red-400 rounded-xl sm:rounded-2xl border border-red-500/20 shadow-inner">
                    <Heart size={20} sm:size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-100 truncate">{hobby.name}</h4>
                    <div className="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                      <History size={12} sm:size={14} />
                      <span className="truncate">Last: {formatLastPracticed(hobby.lastPracticed)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteHobby(hobby._id)} 
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0 bg-white/5 sm:bg-transparent rounded-lg"
                >
                  <Trash2 size={16} sm:size={20} />
                </button>
              </div>
              
              <div className="mt-4 sm:mt-8 flex items-end justify-between border-t border-white/5 pt-4 sm:border-none sm:pt-0">
                <div>
                  <p className="text-[10px] sm:text-sm text-indigo-400 font-bold uppercase tracking-wider mb-0.5 sm:mb-1">Total Time</p>
                  <p className="text-2xl sm:text-4xl font-black text-gray-100">{Math.floor((hobby.timeSpent || 0) / 60)}h <span className="text-lg sm:text-2xl text-gray-400">{(hobby.timeSpent || 0) % 60}m</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    className="w-14 sm:w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 sm:py-2 text-white focus:outline-none focus:border-indigo-500 text-center text-xs sm:text-sm"
                    placeholder="Min"
                    value={manualTime[hobby._id] || ''}
                    onChange={(e) => setManualTime({ ...manualTime, [hobby._id]: e.target.value })}
                  />
                  <button onClick={() => addTime(hobby._id)} className="p-2 sm:p-4 bg-white/5 border border-white/10 text-gray-300 rounded-xl sm:rounded-2xl hover:bg-indigo-500 hover:border-indigo-500 hover:text-white transition-all shrink-0" title="Add Time">
                    <Timer size={18} sm:size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {hobbies.length === 0 && <div className="text-center text-gray-500 py-10 md:col-span-2 text-sm">No hobbies tracked yet. Add your first hobby!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm z-[100] p-4">
          <div className="bg-[#0a0a0a] sm:bg-slate-900 border border-white/10 p-5 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-100">Add New Hobby</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5">Hobby Name</label>
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="What do you love doing?"
                  value={newHobby.name}
                  onChange={(e) => setNewHobby({...newHobby, name: e.target.value})}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5">Initial Time Spent (Minutes)</label>
                <input 
                  type="number" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={newHobby.timeSpent}
                  onChange={(e) => setNewHobby({...newHobby, timeSpent: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 sm:mt-8 pt-4 border-t border-white/5">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              <button onClick={addHobby} className="btn-primary text-sm px-4 py-2">Add Hobby</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hobbies;
