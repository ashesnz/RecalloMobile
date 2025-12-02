// Configuration for API endpoints
import Constants from 'expo-constants';

// Default and fallback base URLs
const DEFAULT_LOCAL_HOST = 'http://localhost:5298';
const DEFAULT_REMOTE = 'http://localhost:5298'; // Intentionally use HTTP for this remote host so the app can connect over cleartext. This is required when the server only exposes an HTTP endpoint.

// Resolve base URL from multiple sources (in order):
// 1. process.env.API_BASE_URL (useful for CI / bundler env)
// 2. expo config `extra.API_BASE_URL` (recommended for Expo / EAS builds)
// 3. hardcoded default remote (the AWS container you provided)
// 4. localhost fallback for local .NET runs
const resolvedBaseUrl =
  (process.env.API_BASE_URL as string | undefined) ||
  // expo SDK 44+ exposes expoConfig.extra
  (Constants.expoConfig?.extra?.API_BASE_URL as string | undefined) ||
  // older SDKs expose manifest.extra
  ((Constants.manifest as any)?.extra?.API_BASE_URL as string | undefined) ||
  DEFAULT_REMOTE ||
  DEFAULT_LOCAL_HOST;

export const API_CONFIG = {
  BASE_URL: resolvedBaseUrl,
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    USER_PROFILE: '/api/auth/me',
    USER_PROFILE_UPDATE: '/api/users/me',
    PROJECTS: '/api/projects',
    DAILY_QUESTIONS: '/api/dailyquestions',
  },
};

// Timeout configuration
export const API_TIMEOUT = 10000; // 10 seconds

// Helper to change the base URL at runtime (updates API_CONFIG.BASE_URL)
export function setApiBaseUrl(url: string) {
  if (!url) return;
  API_CONFIG.BASE_URL = url;
}
