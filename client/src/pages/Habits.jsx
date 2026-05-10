import React, { useState, useEffect } from 'react';
import { Flame, Plus, Check } from 'lucide-react';
import { API_URL } from '../utils/api';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  // Generate Current Week (Monday to Sunday)
  const getWeekDates = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1); // Adjust for Monday start
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i));
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates();
  const today = new Date();
  today.setHours(0,0,0,0);

  useEffect(() => {
    const cachedHabits = localStorage.getItem('habits_cache');
    if (cachedHabits) {
      setHabits(JSON.parse(cachedHabits));
      setLoading(false);
    }
    fetchHabits(false);
  }, []);

  const fetchHabits = async (showLoading = true) => {
    if (showLoading && !localStorage.getItem('habits_cache')) {
      setLoading(true);
    }
    try {
      const res = await fetch(`${API_URL}/api/habits`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
        localStorage.setItem('habits_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitDay = async (habitId, dateStr, isFuture) => {
    if (isFuture) return;
    
    // Optimistic UI update
    const updatedHabits = habits.map(h => {
      if (h._id === habitId) {
        const completedDates = h.completedDates || [];
        const newDates = completedDates.includes(dateStr) 
          ? completedDates.filter(d => d !== dateStr) 
          : [...completedDates, dateStr];
        return { ...h, completedDates: newDates };
      }
      return h;
    });
    setHabits(updatedHabits);
    localStorage.setItem('habits_cache', JSON.stringify(updatedHabits));

    try {
      const res = await fetch(`${API_URL}/api/habits/track`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: habitId, date: dateStr })
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        const finalHabits = habits.map(h => h._id === habitId ? updatedHabit : h);
        setHabits(finalHabits);
        localStorage.setItem('habits_cache', JSON.stringify(finalHabits));
      } else {
        fetchHabits(false); // Revert on failure
      }
    } catch (error) {
      console.error("Error tracking habit:", error);
      fetchHabits(false);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/habits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newHabitName, frequency: 'Daily' })
      });
      if (res.ok) {
        const newHabit = await res.json();
        const updatedHabits = [...habits, newHabit];
        setHabits(updatedHabits);
        localStorage.setItem('habits_cache', JSON.stringify(updatedHabits));
        setNewHabitName('');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Habit Tracker</h2>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Build discipline, one week at a time.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          <span>Add Habit</span>
        </button>
      </div>

      {loading && habits.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {habits.map(habit => (
            <div key={habit._id} className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto space-x-3">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-100 truncate max-w-[200px] sm:max-w-none">{habit.name}</h4>
                  <div className="flex items-center space-x-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold shrink-0">
                    <Flame size={14} sm:size={16} />
                    <span>{habit.streak || 0} <span className="hidden sm:inline">Day</span> Streak</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {weekDates.map((dateObj) => {
                  const dateStr = dateObj.toISOString().split('T')[0];
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const isCompleted = habit.completedDates?.includes(dateStr);
                  
                  // Check if date is in the future
                  const checkDate = new Date(dateObj);
                  checkDate.setHours(0,0,0,0);
                  const isFuture = checkDate > today;
                  const isToday = checkDate.getTime() === today.getTime();
                  
                  return (
                    <div key={dateStr} className="text-center space-y-1 sm:space-y-2">
                      <p className={`text-[9px] sm:text-xs font-bold uppercase ${isToday ? 'text-indigo-400' : 'text-gray-500'}`}>
                        {dayName.charAt(0)}<span className="hidden sm:inline">{dayName.slice(1)}</span>
                      </p>
                      <button 
                        onClick={() => toggleHabitDay(habit._id, dateStr, isFuture)}
                        disabled={isFuture}
                        className={`w-full aspect-square rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 sm:scale-105' 
                            : isFuture
                              ? 'bg-white/5 border border-white/5 text-transparent cursor-not-allowed opacity-50'
                              : 'bg-white/5 border border-white/10 text-transparent hover:bg-white/10'
                        }`}>
                        <Check size={14} sm:size={20} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {habits.length === 0 && <div className="text-center text-gray-500 py-10 text-sm">No habits tracked yet. Add one!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm z-[100] p-4">
          <div className="bg-[#0a0a0a] sm:bg-slate-900 border border-white/10 p-5 sm:p-6 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold mb-4 text-gray-100">Add New Habit</h3>
            <input 
              type="text" 
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 mb-6 transition-colors"
              placeholder="E.g., Drink 3L Water"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              autoFocus
            />
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              <button onClick={addHabit} className="btn-primary text-sm px-4 py-2">Add Habit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
