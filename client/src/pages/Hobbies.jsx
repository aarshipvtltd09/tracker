import React, { useState, useEffect } from 'react';
import { Heart, Plus, Timer, History, Trash2 } from 'lucide-react';

const Hobbies = () => {
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHobby, setNewHobby] = useState({ name: '', timeSpent: 0 });
  const [manualTime, setManualTime] = useState({});

  useEffect(() => {
    fetchHobbies();
  }, []);

  const fetchHobbies = async () => {
    try {
      const res = await fetch('/api/hobbies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHobbies(data);
      }
    } catch (error) {
      console.error("Error fetching hobbies:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTime = async (id) => {
    const timeToAdd = parseInt(manualTime[id] || 30);
    try {
      const res = await fetch(`/api/hobbies/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ timeSpent: timeToAdd })
      });
      if (res.ok) {
        const updatedHobby = await res.json();
        setHobbies(hobbies.map(h => h._id === id ? updatedHobby : h));
        setManualTime({ ...manualTime, [id]: '' });
      }
    } catch (error) {
      console.error("Error adding time:", error);
    }
  };

  const addHobby = async () => {
    if (!newHobby.name.trim()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const res = await fetch('/api/hobbies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newHobby)
      });
      if (res.ok) {
        const hobby = await res.json();
        setHobbies([...hobbies, hobby]);
        setNewHobby({ name: '', timeSpent: 0 });
        setIsModalOpen(false);
      } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.message || "Failed to add hobby"));
      }
    } catch (error) {
      console.error("Error adding hobby:", error);
      alert("Network Error: Could not connect to server.");
    }
  };

  const formatLastPracticed = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const deleteHobby = async (id) => {
    try {
      const res = await fetch(`/api/hobbies/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setHobbies(hobbies.filter(h => h._id !== id));
      }
    } catch (error) {
      console.error("Error deleting hobby:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-100">Hobby Tracker</h2>
          <p className="text-gray-400 mt-1">Track your passions and skill growth.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={20} className="mr-2" />
          <span>Add Hobby</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading hobbies...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hobbies.map(hobby => (
            <div key={hobby._id} className="card group relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 shadow-inner">
                    <Heart size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-100">{hobby.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                      <History size={14} />
                      <span>Last: {formatLastPracticed(hobby.lastPracticed)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteHobby(hobby._id)} 
                  className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-1">Total Time</p>
                  <p className="text-4xl font-black text-gray-100">{Math.floor((hobby.timeSpent || 0) / 60)}h <span className="text-2xl text-gray-400">{(hobby.timeSpent || 0) % 60}m</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-center text-sm"
                    placeholder="Min"
                    value={manualTime[hobby._id] || ''}
                    onChange={(e) => setManualTime({ ...manualTime, [hobby._id]: e.target.value })}
                  />
                  <button onClick={() => addTime(hobby._id)} className="p-4 bg-white/5 border border-white/10 text-gray-300 rounded-2xl hover:bg-indigo-500 hover:border-indigo-500 hover:text-white transition-all" title="Add Time">
                    <Timer size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {hobbies.length === 0 && <div className="text-center text-gray-500 py-10 md:col-span-2">No hobbies tracked yet. Add your first hobby!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-card shadow-2xl w-full max-w-md animate-slide-up">
            <h3 className="text-2xl font-bold mb-6 text-gray-100">Add New Hobby</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Hobby Name</label>
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="What do you love doing?"
                  value={newHobby.name}
                  onChange={(e) => setNewHobby({...newHobby, name: e.target.value})}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Initial Time Spent (Minutes)</label>
                <input 
                  type="number" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={newHobby.timeSpent}
                  onChange={(e) => setNewHobby({...newHobby, timeSpent: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={addHobby} className="btn-primary">Add Hobby</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hobbies;
