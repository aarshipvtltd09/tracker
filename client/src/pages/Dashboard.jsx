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

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    fetchDashboardData();
  }, []);

  const togglePriority = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const tasksRes = await fetch(`${API_URL}/api/tasks`, { headers });
      const tasks = await tasksRes.json();
      
      const habitsRes = await fetch(`${API_URL}/api/habits`, { headers });
      const habits = await habitsRes.json();
      
      const hobbiesRes = await fetch(`${API_URL}/api/hobbies`, { headers });
      const hobbiesData = await hobbiesRes.json();

      const goalsRes = await fetch(`${API_URL}/api/goals`, { headers });
      const goalsData = await goalsRes.json();
      setGoals(goalsData || []);

      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const totalFocusMins = (hobbiesData || []).reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
      const bestStreak = (habits || []).reduce((max, curr) => Math.max(max, curr.streak || 0), 0);

      setStats({
        tasksDone: completedTasks,
        activeHabits: (habits || []).length,
        streak: bestStreak,
        focusHours: Math.floor(totalFocusMins / 60)
      });

      const highPriority = (tasks || []).filter(t => t.priority === 'High' && t.status !== 'Completed');
      setPriorities(highPriority.slice(0, 5));

      const newInsights = [];
      
      // 24 Hour Alert for High Priority
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

      // Deadline Reminders
      const soonDeadlines = tasks.filter(t => {
        if (!t.deadline || t.status === 'Completed') return false;
        const deadline = new Date(t.deadline);
        const diff = deadline - now;
        return diff > 0 && diff < 2 * 24 * 60 * 60 * 1000; // Within 2 days
      });

      soonDeadlines.forEach(t => {
        newInsights.push({
          text: `Reminder: Task "${t.title}" deadline is approaching!`,
          type: 'warning'
        });
      });

      if (newInsights.length === 0) {
        newInsights.push({ text: "All systems clear. You're doing great!", type: 'success' });
      }
      
      setInsights(newInsights);
      
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-100">Hey, {user.name.split(' ')[0]}!</h2>
          <p className="text-gray-400 mt-1 text-base md:text-lg">Here's your productivity overview.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Tasks" value={stats.tasksDone} icon={<CheckCircle className="text-indigo-400" />} />
        <StatCard title="Habits" value={stats.activeHabits} icon={<TrendingUp className="text-blue-400" />} />
        <StatCard title="Streak" value={stats.streak} icon={<Flame className="text-orange-400" />} />
        <StatCard title="Focus" value={`${stats.focusHours}h`} icon={<Clock className="text-purple-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
            <h3 className="text-xl font-bold text-red-400 flex items-center mb-4">
              <AlertTriangle size={20} className="mr-2 animate-pulse" /> Critical Priorities
            </h3>
            <div className="space-y-3">
              {priorities.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-4 bg-black/40 border border-red-500/10 rounded-xl hover:border-red-500/50 transition-all group shadow-lg shadow-red-500/5">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => togglePriority(p._id, p.status)}
                      className="w-6 h-6 rounded-lg border border-red-500/30 flex items-center justify-center transition-all hover:bg-red-500/20"
                    >
                      <Check size={14} className="text-transparent group-hover:text-red-400" strokeWidth={3} />
                    </button>
                    <span className="font-bold text-gray-100">{p.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter">Urgent</span>
                  </div>
                </div>
              ))}
              {priorities.length === 0 && (
                <div className="text-gray-500 text-center py-6 italic text-sm">No high priority tasks. Enjoy your day!</div>
              )}
            </div>
          </div>

          {/* New Dedicated Goals Section */}
          <div className="card bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <h3 className="text-xl font-bold text-white flex items-center mb-6">
              <CheckCircle className="mr-3 text-indigo-400" /> Active Focus Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.length > 0 ? goals.slice(0, 4).map(goal => (
                <div key={goal._id} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center space-x-4">
                  <div className="w-2 h-10 bg-indigo-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-100">{goal.title}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Target Goal</p>
                  </div>
                </div>
              )) : (
                <p className="col-span-2 text-gray-500 text-sm italic text-center py-4">No goals set. Add them in your Profile!</p>
              )}
            </div>
          </div>
        </div>

        {/* Smart Insights */}
        <div className="card space-y-6 h-fit bg-white/5 border-white/10">
          <h3 className="text-xl font-bold text-gray-100 flex items-center">
            <TrendingUp size={20} className="mr-2 text-indigo-400" /> System Insights
          </h3>
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${
                insight.type === 'warning' 
                  ? 'bg-red-500/5 border-red-500/20 text-red-200' 
                  : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-100'
              }`}>
                <div className="flex items-start space-x-3">
                  {insight.type === 'warning' ? <AlertTriangle size={18} className="text-red-400 shrink-0" /> : <TrendingUp size={18} className="text-indigo-400 shrink-0" />}
                  <p className="text-xs font-semibold leading-relaxed">{insight.text}</p>
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
  <div className="card flex items-center justify-between group overflow-hidden relative">
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="relative z-10">
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      <p className="text-3xl font-bold mt-2 text-gray-100">{value}</p>
    </div>
    <div className="p-3 bg-white/5 rounded-xl border border-white/10 relative z-10 group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </div>
);

export default Dashboard;
