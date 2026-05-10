// Base API URL configuration
export const API_URL = import.meta.env.DEV ? 'http://localhost:5000' : 'https://tracker-k4en.onrender.com';

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
