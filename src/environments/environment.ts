const isProduction = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

export const environment = {
  production: isProduction,
  apiUrl: isProduction 
    ? 'https://backend-cztn.onrender.com/api' 
    : 'http://localhost:5000/api',
  wsUrl: isProduction 
    ? 'https://backend-cztn.onrender.com' 
    : 'http://localhost:5000'
};
