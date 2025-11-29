// Configuration for API endpoints
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5298', // Your .NET backend URL
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    USER_PROFILE: '/api/auth/profile',
  },
};

// Timeout configuration
export const API_TIMEOUT = 10000; // 10 seconds

