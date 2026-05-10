import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API_URL } from '../utils/api';

const Analytics = () => {
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedPie = localStorage.getItem('analytics_pie');
    const cachedBar = localStorage.getItem('analytics_bar');
    if (cachedPie && cachedBar) {
      setPieData(JSON.parse(cachedPie));
      setBarData(JSON.parse(cachedBar));
      setLoading(false);
    }
    fetchAnalyticsData(false);
  }, []);

  const fetchAnalyticsData = async (showLoading = true) => {
    if (showLoading && !localStorage.getItem('analytics_pie')) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const tasks = await res.json();
      
      // Calculate Pie Data
      const categoryCounts = {};
      tasks.forEach(t => {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      });

      const formattedPie = Object.keys(categoryCounts).map((key, idx) => ({
        name: key,
        value: categoryCounts[key],
        color: colors[idx % colors.length]
      }));

      if (formattedPie.length === 0) {
        formattedPie.push({ name: 'No Data', value: 1, color: '#4b5563' });
      }
      setPieData(formattedPie);
      localStorage.setItem('analytics_pie', JSON.stringify(formattedPie));

      // Calculate Weekly Bar Data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push({
          dateStr: d.toISOString().split('T')[0],
          name: days[d.getDay()],
          completed: 0,
          total: 0
        });
      }

      tasks.forEach(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        const dayMatch = last7Days.find(d => d.dateStr === taskDate);
        if (dayMatch) {
          dayMatch.total += 1;
          if (task.status === 'Completed') dayMatch.completed += 1;
        }
      });

      setBarData(last7Days);
      localStorage.setItem('analytics_bar', JSON.stringify(last7Days));

    } catch (error) {
      console.error("Error fetching analytics data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="px-2">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-100">Analytics Dashboard</h2>
        <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-lg">Analyze your execution patterns based on live tasks.</p>
      </div>

      {loading && pieData.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Task Completion Bar Chart */}
          <div className="card h-[350px] md:h-[450px] flex flex-col p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-100 mb-4 md:mb-6">Task Completion (Weekly Mockup)</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff15" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#ffffff10'}} 
                    contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)', color: '#f3f4f6'}} 
                    itemStyle={{color: '#f3f4f6'}}
                  />
                  <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="planned" fill="#ffffff20" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown Pie Chart */}
          <div className="card h-[400px] md:h-[450px] flex flex-col p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-100 mb-2 md:mb-6">Category Breakdown (Live)</h3>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}} 
                    itemStyle={{color: '#f3f4f6'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center flex-wrap gap-2 md:gap-4 mt-4 md:mt-6">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center space-x-2 bg-white/5 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-white/5">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full shadow-lg" style={{backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}80`}}></div>
                  <span className="text-xs md:text-sm font-medium text-gray-300">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
