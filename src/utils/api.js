import axios from 'axios';

// The base URL for the backend API
// In development, it defaults to localhost:8080
// In production (Vercel), it will use the environment variable VITE_API_BASE_URL
const rawURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
// Normalize by removing trailing slash if exists
const API_BASE_URL = rawURL.endsWith('/') ? rawURL.slice(0, -1) : rawURL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export { API_BASE_URL };
