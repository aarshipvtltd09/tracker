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
    fetchTodayLog();
  }, []);

  const fetchTodayLog = async () => {
    try {
      const res = await fetch(`${API_URL}/api/logs`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const allLogs = await res.json();
        setLogs(allLogs);
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
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const method = editingId ? 'PATCH' : 'POST';
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
        fetchTodayLog();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };

  const deleteLog = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/logs/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchTodayLog();
        if (id === editingId) {
          setEditingId(null);
          setLog({ notes: '', mood: 'Good', date: todayStr });
        }
      }
    } catch (error) {
      console.error("Error deleting log:", error);
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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-100">Daily Reflection</h2>
        <p className="text-gray-400 mt-2 text-lg">Review your execution and plan for tomorrow.</p>
      </div>

      <div className="card space-y-6 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
            <Calendar size={20} />
            <span>{editingId ? `Editing: ${log.date}` : `Today: ${new Date().toLocaleDateString()}`}</span>
          </div>
          <div className="flex space-x-2 bg-black/20 p-1.5 rounded-full border border-white/5">
            {['Bad', 'Neutral', 'Good', 'Amazing'].map(m => (
              <button 
                key={m}
                onClick={() => setLog({...log, mood: m})}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
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

        <div className="space-y-4 relative z-10">
          <label className="block font-bold text-gray-200 text-lg">What did you accomplish today?</label>
          {loading ? (
            <div className="text-gray-500 py-4">Loading today's log...</div>
          ) : (
            <textarea 
              rows="6"
              className="w-full bg-black/30 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-gray-600 text-gray-100 transition-all resize-none shadow-inner"
              placeholder="Write your thoughts, victories, or lessons learned..."
              value={log.notes}
              onChange={(e) => setLog({...log, notes: e.target.value})}
            ></textarea>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/5 relative z-10 gap-4">
          <div className="flex items-center space-x-2 text-yellow-500">
            <Star size={20} fill="currentColor" />
            <span className="font-bold tracking-wide">Consistency is key.</span>
          </div>
          <div className="flex space-x-3">
            {editingId && (
              <button onClick={() => { setEditingId(null); setLog({ notes: '', mood: 'Good', date: todayStr }); }} className="btn-secondary">New Reflection</button>
            )}
            <button 
              onClick={handleSave}
              disabled={loading}
              className={`btn-primary flex items-center space-x-2 min-w-[180px] justify-center transition-all duration-300 ${saved ? 'bg-emerald-500 from-emerald-500 to-emerald-400 shadow-emerald-500/30' : ''}`}
            >
              {saved ? (
                <>
                  <CheckCircle size={20} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>{editingId ? 'Update Reflection' : 'Save Reflection'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-12">
        <h3 className="text-2xl font-bold text-gray-200 flex items-center space-x-2">
          <Clock className="text-indigo-400" />
          <span>Past Reflections</span>
        </h3>
        <div className="grid gap-4">
          {logs.map(l => (
            <div key={l._id} className="card p-6 bg-white/5 hover:bg-white/10 transition-colors group">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-400 font-bold">{l.date}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      l.mood === 'Amazing' ? 'bg-emerald-500/20 text-emerald-400' :
                      l.mood === 'Good' ? 'bg-indigo-500/20 text-indigo-400' :
                      l.mood === 'Neutral' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {l.mood}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-3 whitespace-pre-wrap leading-relaxed">{l.notes}</p>
                  <div className="text-[10px] text-gray-500 mt-4 flex items-center space-x-1">
                    <Clock size={10} />
                    <span>Saved at: {new Date(l.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(l)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/5 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteLog(l._id)} className="p-2 text-gray-400 hover:text-red-400 bg-white/5 rounded-lg border border-white/5 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-gray-500 italic">No reflections saved yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default DailyLog;
