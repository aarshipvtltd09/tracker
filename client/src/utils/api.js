// Base API URL configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://tracker-k4en.onrender.com'; 

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
