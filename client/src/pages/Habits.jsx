import React, { useState, useEffect } from 'react';
import { Flame, Plus, Check } from 'lucide-react';

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
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await fetch('/api/habits', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitDay = async (habitId, dateStr, isFuture) => {
    if (isFuture) return; // Prevent clicking future dates
    try {
      const res = await fetch('/api/habits/track', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: habitId, date: dateStr })
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        setHabits(habits.map(h => h._id === habitId ? updatedHabit : h));
      }
    } catch (error) {
      console.error("Error tracking habit:", error);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newHabitName, frequency: 'Daily' })
      });
      if (res.ok) {
        const newHabit = await res.json();
        setHabits([...habits, newHabit]);
        setNewHabitName('');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Habit Tracker</h2>
          <p className="text-gray-400 mt-1">Build discipline, one week at a time.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={20} className="mr-2" />
          <span>Add Habit</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading habits...</div>
      ) : (
        <div className="grid gap-6">
          {habits.map(habit => (
            <div key={habit._id} className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h4 className="text-xl font-bold text-gray-100">{habit.name}</h4>
                  <div className="flex items-center space-x-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-bold">
                    <Flame size={16} />
                    <span>{habit.streak || 0} Day Streak</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
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
                    <div key={dateStr} className="text-center space-y-2">
                      <p className={`text-xs font-bold uppercase ${isToday ? 'text-indigo-400' : 'text-gray-500'}`}>
                        {dayName}
                      </p>
                      <button 
                        onClick={() => toggleHabitDay(habit._id, dateStr, isFuture)}
                        disabled={isFuture}
                        className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 scale-105' 
                            : isFuture
                              ? 'bg-white/5 border border-white/5 text-transparent cursor-not-allowed opacity-50'
                              : 'bg-white/5 border border-white/10 text-transparent hover:bg-white/10'
                        }`}>
                        <Check size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {habits.length === 0 && <div className="text-center text-gray-500 py-10">No habits tracked yet. Add one!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-card shadow-2xl w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold mb-4 text-gray-100">Add New Habit</h3>
            <input 
              type="text" 
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 mb-4 transition-colors"
              placeholder="E.g., Drink 3L Water"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={addHabit} className="btn-primary">Add Habit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
