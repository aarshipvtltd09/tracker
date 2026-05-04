import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Filter, CheckCircle2 } from 'lucide-react';

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
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(tasks.map(t => t._id === id ? updatedTask : t));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTask,
          status: 'Pending'
        })
      });
      
      if (res.ok) {
        const savedTask = await res.json();
        setTasks([savedTask, ...tasks]);
        setNewTask({ title: '', category: 'General', priority: 'Medium', deadline: '' });
        setIsModalOpen(false);
      } else {
        const errorData = await res.json();
        alert("Error from server: " + (errorData.message || "Failed to add task"));
      }
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Network Error: Could not connect to server.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Task Manager</h2>
          <p className="text-gray-400 mt-1">Stop thinking, start doing.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={20} className="mr-2" />
          <span>New Task</span>
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button className="flex items-center space-x-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
          <Filter size={16} />
          <span>Filter by Category</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading tasks...</div>
      ) : (
        <div className="grid gap-4">
          {tasks.map(task => (
            <div key={task._id} className="card group flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input 
                  type="checkbox" 
                  checked={task.status === 'Completed'}
                  onChange={() => toggleTask(task._id, task.status)}
                  className="custom-checkbox"
                />
                <div>
                  <h4 className={`font-semibold ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs font-medium text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">
                      {task.category}
                    </span>
                    <span className={`text-xs font-bold ${
                      task.priority === 'High' ? 'text-red-400' : 
                      task.priority === 'Medium' ? 'text-yellow-400' : 
                      'text-emerald-400'
                    }`}>
                      {task.priority}
                    </span>
                    {task.deadline && (
                      <span className="text-[10px] text-gray-500 flex items-center space-x-1">
                        <Plus size={10} className="rotate-45" />
                        <span>{new Date(task.deadline).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteTask(task._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <div className="text-center text-gray-500 py-10">No tasks yet. Create one!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-card shadow-2xl w-full max-w-lg animate-slide-up">
            <h3 className="text-2xl font-bold mb-6 text-gray-100">Add New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Task Title</label>
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                  <select 
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="General, Work, Study..."
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Deadline</label>
                <input 
                  type="date" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={addTask} className="btn-primary">Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
