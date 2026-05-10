import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Flame, TrendingUp, AlertTriangle, Check } from 'lucide-react';
import { API_URL } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    tasksDone: 0,
    activeHabits: 0,
    streak: 0,
    focusHours: 0,
  });

  const [insights, setInsights] = useState([]);
  const [goals, setGoals] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [user, setUser] = useState({ name: 'User' });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    // Load cached data first for instant UI
    const cachedStats = localStorage.getItem('dashboard_stats');
    if (cachedStats) {
      setStats(JSON.parse(cachedStats));
      setLoading(false);
    }
    
    fetchDashboardData();
  }, []);

  const togglePriority = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      // Optimistic UI Update
      setPriorities(priorities.map(p => p._id === id ? { ...p, status: newStatus } : p));
      
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDashboardData(false); // fetch without showing loading screen
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading && !localStorage.getItem('dashboard_stats')) {
      setLoading(true);
    }
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      // Fetch everything in PARALLEL to fix delay
      const [tasksRes, habitsRes, hobbiesRes, goalsRes] = await Promise.all([
        fetch(`${API_URL}/api/tasks`, { headers }),
        fetch(`${API_URL}/api/habits`, { headers }),
        fetch(`${API_URL}/api/hobbies`, { headers }),
        fetch(`${API_URL}/api/goals`, { headers })
      ]);

      const tasks = await tasksRes.json();
      const habits = await habitsRes.json();
      const hobbiesData = await hobbiesRes.json();
      const goalsData = await goalsRes.json();

      setGoals(goalsData || []);

      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const totalFocusMins = (hobbiesData || []).reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
      const bestStreak = (habits || []).reduce((max, curr) => Math.max(max, curr.streak || 0), 0);

      const newStats = {
        tasksDone: completedTasks,
        activeHabits: (habits || []).length,
        streak: bestStreak,
        focusHours: Math.floor(totalFocusMins / 60)
      };

      setStats(newStats);
      localStorage.setItem('dashboard_stats', JSON.stringify(newStats)); // Cache it

      const highPriority = (tasks || []).filter(t => t.priority === 'High' && t.status !== 'Completed');
      setPriorities(highPriority.slice(0, 5));

      const newInsights = [];
      const now = new Date();
      const overdueHigh = highPriority.filter(t => {
        const created = new Date(t.createdAt);
        return (now - created) > 24 * 60 * 60 * 1000;
      });

      if (overdueHigh.length > 0) {
        newInsights.push({ 
          text: `Alert: ${overdueHigh.length} High Priority task(s) are older than 24h!`, 
          type: 'warning' 
        });
      }

      const soonDeadlines = tasks.filter(t => {
        if (!t.deadline || t.status === 'Completed') return false;
        const diff = new Date(t.deadline) - now;
        return diff > 0 && diff < 2 * 24 * 60 * 60 * 1000;
      });

      soonDeadlines.forEach(t => {
        newInsights.push({ text: `Reminder: Task "${t.title}" deadline is approaching!`, type: 'warning' });
      });

      if (newInsights.length === 0) {
        newInsights.push({ text: "All systems clear. You're doing great!", type: 'success' });
      }
      
      setInsights(newInsights);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !localStorage.getItem('dashboard_stats')) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">Syncing your data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-100">Hey, {user.name.split(' ')[0]}!</h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base md:text-lg">Here's your productivity overview.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard title="Tasks" value={stats.tasksDone} icon={<CheckCircle className="text-indigo-400 w-5 h-5 sm:w-6 sm:h-6" />} />
        <StatCard title="Habits" value={stats.activeHabits} icon={<TrendingUp className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />} />
        <StatCard title="Streak" value={stats.streak} icon={<Flame className="text-orange-400 w-5 h-5 sm:w-6 sm:h-6" />} />
        <StatCard title="Focus" value={`${stats.focusHours}h`} icon={<Clock className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Today's Tasks Summary */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="card border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-red-400 flex items-center mb-3 sm:mb-4">
              <AlertTriangle size={20} className="mr-2 animate-pulse" /> Critical Priorities
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {priorities.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 sm:p-4 bg-black/40 border border-red-500/10 rounded-xl hover:border-red-500/50 transition-all group shadow-lg shadow-red-500/5">
                  <div className="flex items-center space-x-3 sm:space-x-4 overflow-hidden">
                    <button 
                      onClick={() => togglePriority(p._id, p.status)}
                      className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-lg border border-red-500/30 flex items-center justify-center transition-all hover:bg-red-500/20"
                    >
                      <Check size={14} className="text-transparent group-hover:text-red-400" strokeWidth={3} />
                    </button>
                    <span className="font-bold text-sm sm:text-base text-gray-100 truncate">{p.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <span className="text-[9px] sm:text-[10px] bg-red-500 text-white px-1.5 sm:px-2 py-0.5 rounded font-black uppercase tracking-tighter">Urgent</span>
                  </div>
                </div>
              ))}
              {priorities.length === 0 && (
                <div className="text-gray-500 text-center py-4 sm:py-6 italic text-xs sm:text-sm">No high priority tasks. Enjoy your day!</div>
              )}
            </div>
          </div>

          {/* New Dedicated Goals Section */}
          <div className="card bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center mb-4 sm:mb-6">
              <CheckCircle className="mr-2 sm:mr-3 text-indigo-400" /> Active Focus Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {goals.length > 0 ? goals.slice(0, 4).map(goal => (
                <div key={goal._id} className="p-3 sm:p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center space-x-3 sm:space-x-4">
                  <div className="w-1.5 sm:w-2 h-8 sm:h-10 bg-indigo-500 rounded-full shrink-0"></div>
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm font-bold text-gray-100 truncate">{goal.title}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5 sm:mt-1">Target Goal</p>
                  </div>
                </div>
              )) : (
                <p className="col-span-1 md:col-span-2 text-gray-500 text-xs sm:text-sm italic text-center py-3 sm:py-4">No goals set. Add them in your Profile!</p>
              )}
            </div>
          </div>
        </div>

        {/* Smart Insights */}
        <div className="card space-y-4 sm:space-y-6 h-fit bg-white/5 border-white/10 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-100 flex items-center">
            <TrendingUp size={20} className="mr-2 text-indigo-400" /> System Insights
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {insights.map((insight, idx) => (
              <div key={idx} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                insight.type === 'warning' 
                  ? 'bg-red-500/5 border-red-500/20 text-red-200' 
                  : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-100'
              }`}>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  {insight.type === 'warning' ? <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" /> : <TrendingUp size={16} className="text-indigo-400 shrink-0 mt-0.5" />}
                  <p className="text-[11px] sm:text-xs font-semibold leading-relaxed">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="card flex items-center justify-between group overflow-hidden relative p-3 sm:p-5">
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="relative z-10">
      <p className="text-[10px] sm:text-sm text-gray-400 font-medium">{title}</p>
      <p className="text-lg sm:text-3xl font-bold mt-0.5 sm:mt-2 text-gray-100">{value}</p>
    </div>
    <div className="p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 relative z-10 group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </div>
);

export default Dashboard;
