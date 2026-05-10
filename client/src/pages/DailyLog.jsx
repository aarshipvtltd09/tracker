import React, { useState, useEffect } from 'react';
import { Save, Calendar, Star, CheckCircle, Trash2, Edit2, Clock } from 'lucide-react';
import { API_URL } from '../utils/api';

const DailyLog = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [log, setLog] = useState({
    notes: '',
    mood: 'Good',
    date: todayStr
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const cachedLogs = localStorage.getItem('logs_cache');
    if (cachedLogs) {
      const parsedLogs = JSON.parse(cachedLogs);
      setLogs(parsedLogs);
      const todayLog = parsedLogs.find(l => l.date === todayStr);
      if (todayLog) {
        setLog({
          notes: todayLog.notes || '',
          mood: todayLog.mood || 'Good',
          date: todayStr
        });
        setEditingId(todayLog._id);
      }
      setLoading(false);
    }
    fetchTodayLog(false);
  }, []);

  const fetchTodayLog = async (showLoading = true) => {
    if (showLoading && !localStorage.getItem('logs_cache')) {
      setLoading(true);
    }
    try {
      const res = await fetch(`${API_URL}/api/logs`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const allLogs = await res.json();
        setLogs(allLogs);
        localStorage.setItem('logs_cache', JSON.stringify(allLogs));
        
        // Update current editing state if not actively typing
        if (!editingId) {
          const todayLog = allLogs.find(l => l.date === todayStr);
          if (todayLog) {
            setLog({
              notes: todayLog.notes || '',
              mood: todayLog.mood || 'Good',
              date: todayStr
            });
            setEditingId(todayLog._id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Optimistic Update
    const method = editingId ? 'PATCH' : 'POST';
    const tempId = editingId || 'temp-' + Date.now();
    const newLogObj = { _id: tempId, ...log, createdAt: new Date().toISOString() };
    
    let updatedLogs;
    if (editingId) {
      updatedLogs = logs.map(l => l._id === editingId ? newLogObj : l);
    } else {
      updatedLogs = [newLogObj, ...logs];
    }
    setLogs(updatedLogs);
    localStorage.setItem('logs_cache', JSON.stringify(updatedLogs));

    try {
      const url = editingId ? `${API_URL}/api/logs/${editingId}` : `${API_URL}/api/logs`;
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(log)
      });
      if (res.ok) {
        setSaved(true);
        fetchTodayLog(false);
        setTimeout(() => setSaved(false), 3000);
      } else {
        fetchTodayLog(false); // revert
      }
    } catch (error) {
      console.error("Error saving log:", error);
      fetchTodayLog(false);
    }
  };

  const deleteLog = async (id) => {
    const filteredLogs = logs.filter(l => l._id !== id);
    setLogs(filteredLogs);
    localStorage.setItem('logs_cache', JSON.stringify(filteredLogs));

    try {
      const res = await fetch(`${API_URL}/api/logs/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        if (id === editingId) {
          setEditingId(null);
          setLog({ notes: '', mood: 'Good', date: todayStr });
        }
        fetchTodayLog(false);
      } else {
        fetchTodayLog(false); // revert
      }
    } catch (error) {
      console.error("Error deleting log:", error);
      fetchTodayLog(false);
    }
  };

  const startEdit = (selectedLog) => {
    setLog({
      notes: selectedLog.notes,
      mood: selectedLog.mood,
      date: selectedLog.date
    });
    setEditingId(selectedLog._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="text-center px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-100">Daily Reflection</h2>
        <p className="text-gray-400 mt-2 text-sm md:text-lg">Review your execution and plan for tomorrow.</p>
      </div>

      <div className="card space-y-4 md:space-y-6 p-4 sm:p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-center space-x-2 text-indigo-400 font-semibold bg-indigo-500/10 px-4 py-2 rounded-xl sm:rounded-full border border-indigo-500/20 text-sm sm:text-base">
            <Calendar size={18} className="sm:w-5 sm:h-5" />
            <span>{editingId ? `Editing: ${log.date}` : `Today: ${new Date().toLocaleDateString()}`}</span>
          </div>
          <div className="flex justify-center space-x-1 sm:space-x-2 bg-black/20 p-1 sm:p-1.5 rounded-xl sm:rounded-full border border-white/5 overflow-x-auto no-scrollbar">
            {['Bad', 'Neutral', 'Good', 'Amazing'].map(m => (
              <button 
                key={m}
                onClick={() => setLog({...log, mood: m})}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  log.mood === m 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 relative z-10">
          <label className="block font-bold text-gray-200 text-base sm:text-lg">What did you accomplish today?</label>
          {loading && logs.length === 0 ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <textarea 
              rows="6"
              className="w-full bg-black/30 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-gray-600 text-gray-100 transition-all resize-none shadow-inner"
              placeholder="Write your thoughts, victories, or lessons learned..."
              value={log.notes}
              onChange={(e) => setLog({...log, notes: e.target.value})}
            ></textarea>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/5 relative z-10 gap-4">
          <div className="flex items-center space-x-2 text-yellow-500 hidden sm:flex">
            <Star size={18} fill="currentColor" />
            <span className="font-bold tracking-wide text-sm">Consistency is key.</span>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-3">
            {editingId && (
              <button onClick={() => { setEditingId(null); setLog({ notes: '', mood: 'Good', date: todayStr }); }} className="btn-secondary text-sm px-4 py-2 w-full sm:w-auto">New Reflection</button>
            )}
            <button 
              onClick={handleSave}
              disabled={loading && logs.length === 0}
              className={`btn-primary text-sm px-4 py-2 flex items-center space-x-2 min-w-[150px] sm:min-w-[180px] justify-center transition-all w-full sm:w-auto ${saved ? 'bg-emerald-500 from-emerald-500 to-emerald-400 shadow-emerald-500/30' : ''}`}
            >
              {saved ? (
                <>
                  <CheckCircle size={18} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{editingId ? 'Update Reflection' : 'Save Reflection'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-8 md:mt-12 px-2">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-200 flex items-center space-x-2">
          <Clock className="text-indigo-400 w-5 h-5 sm:w-6 sm:h-6" />
          <span>Past Reflections</span>
        </h3>
        <div className="grid gap-3 sm:gap-4">
          {logs.map(l => (
            <div key={l._id} className="card p-4 sm:p-6 bg-white/5 hover:bg-white/10 transition-colors group">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex flex-col w-full">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-indigo-400 font-bold text-sm sm:text-base">{l.date}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase ${
                      l.mood === 'Amazing' ? 'bg-emerald-500/20 text-emerald-400' :
                      l.mood === 'Good' ? 'bg-indigo-500/20 text-indigo-400' :
                      l.mood === 'Neutral' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {l.mood}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-2 sm:mt-3 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{l.notes}</p>
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center space-x-1">
                      <Clock size={10} />
                      <span>Saved at: {new Date(l.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {/* Action buttons visible on mobile, visible on hover on desktop */}
                    <div className="flex space-x-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(l)} className="p-1.5 sm:p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/5 transition-colors">
                        <Edit2 size={14} sm:size={16} />
                      </button>
                      <button onClick={() => deleteLog(l._id)} className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 bg-white/5 rounded-lg border border-white/5 transition-colors">
                        <Trash2 size={14} sm:size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-gray-500 italic text-sm text-center py-6">No reflections saved yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default DailyLog;
