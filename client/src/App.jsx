import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Habits from './pages/Habits';
import Hobbies from './pages/Hobbies';
import Analytics from './pages/Analytics';
import DailyLog from './pages/DailyLog';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) {
    return <Auth setToken={setToken} />;
  }

  return (
    <Router>
      <Layout setToken={setToken}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/hobbies" element={<Hobbies />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/log" element={<DailyLog />} />
          <Route path="/profile" element={<Profile setToken={setToken} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
