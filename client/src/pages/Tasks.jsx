import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Filter, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../utils/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'General',
    priority: 'Medium',
    deadline: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optimistic cache load
    const cachedTasks = localStorage.getItem('tasks_cache');
    if (cachedTasks) {
      setTasks(JSON.parse(cachedTasks));
      setLoading(false);
    }
    fetchTasks(false); // background fetch
  }, []);

  const fetchTasks = async (showLoading = true) => {
    if (showLoading && !localStorage.getItem('tasks_cache')) {
      setLoading(true);
    }
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        localStorage.setItem('tasks_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    // Optimistic UI update
    const updatedTasks = tasks.map(t => t._id === id ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    localStorage.setItem('tasks_cache', JSON.stringify(updatedTasks));

    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        fetchTasks(false); // revert if failed
      }
    } catch (error) {
      console.error("Error updating task:", error);
      fetchTasks(false);
    }
  };

  const deleteTask = async (id) => {
    const filteredTasks = tasks.filter(t => t._id !== id);
    setTasks(filteredTasks);
    localStorage.setItem('tasks_cache', JSON.stringify(filteredTasks));

    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) fetchTasks(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      fetchTasks(false);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("Session expired. Please login again.");

      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newTask, status: 'Pending' })
      });
      
      if (res.ok) {
        const savedTask = await res.json();
        const updatedTasks = [savedTask, ...tasks];
        setTasks(updatedTasks);
        localStorage.setItem('tasks_cache', JSON.stringify(updatedTasks));
        setNewTask({ title: '', category: 'General', priority: 'Medium', deadline: '' });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Task Manager</h2>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Stop thinking, start doing.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          <span>New Task</span>
        </button>
      </div>

      <div className="flex space-x-2 md:space-x-4 mb-4 md:mb-6 overflow-x-auto no-scrollbar pb-2">
        <button className="flex items-center space-x-2 text-xs md:text-sm font-medium text-gray-300 bg-white/5 border border-white/10 px-3 md:px-4 py-2 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap">
          <Filter size={14} md:size={16} />
          <span>Filter by Category</span>
        </button>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {tasks.map(task => (
            <div key={task._id} className="card group flex items-start sm:items-center justify-between p-3 sm:p-5">
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 w-full overflow-hidden">
                <input 
                  type="checkbox" 
                  checked={task.status === 'Completed'}
                  onChange={() => toggleTask(task._id, task.status)}
                  className="custom-checkbox shrink-0 mt-1 sm:mt-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className={`font-semibold text-sm sm:text-base break-words ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2">
                    <span className="text-[10px] sm:text-xs font-medium text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">
                      {task.category}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold ${
                      task.priority === 'High' ? 'text-red-400' : 
                      task.priority === 'Medium' ? 'text-yellow-400' : 
                      'text-emerald-400'
                    }`}>
                      {task.priority}
                    </span>
                    {task.deadline && (
                      <span className="text-[9px] sm:text-[10px] text-gray-500 flex items-center space-x-1 shrink-0">
                        <Plus size={8} className="rotate-45" />
                        <span>{new Date(task.deadline).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 pl-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteTask(task._id)} className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                  <Trash2 size={16} sm:size={18} />
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <div className="text-center text-gray-500 py-10 text-sm">No tasks yet. Create one!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm z-[100] p-4">
          <div className="bg-[#0a0a0a] sm:bg-slate-900 border border-white/10 p-5 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-100">Add New Task</h3>
            
            <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5">Task Title</label>
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5">Priority</label>
                  <select 
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5">Category</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="General, Work..."
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5">Deadline</label>
                <input 
                  type="date" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 sm:mt-8 pt-4 border-t border-white/5">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              <button onClick={addTask} className="btn-primary text-sm px-4 py-2">Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
