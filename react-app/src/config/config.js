// Environment configuration
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  authUrl: import.meta.env.VITE_AUTH_URL || 'http://localhost:5000/api/auth',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;