// Small helper to centralize the API base URL and endpoints.
import Constants from 'expo-constants';

function resolveBaseUrl(): string {
  return (
    (Constants.expoConfig?.extra?.API_BASE_URL as string | undefined) ||
    ((Constants.manifest as any)?.extra?.API_BASE_URL as string | undefined) ||
    (process.env.API_BASE_URL as string | undefined) ||
    ''
  );
}

const initialBaseUrl = resolveBaseUrl();
if (!initialBaseUrl && typeof __DEV__ !== 'undefined' && __DEV__) {
  console.warn('API_BASE_URL not set. Configure expo.extra.API_BASE_URL or process.env.API_BASE_URL.');
}

export const API_CONFIG = {
  BASE_URL: initialBaseUrl,
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    USER_PROFILE: '/api/auth/me',
    USER_PROFILE_UPDATE: '/api/users/me',
    PROJECTS: '/api/projects',
    DAILY_QUESTIONS: '/api/dailyquestions',
    TRANSCRIBE_AUDIO: '/api/audio/transcribe',
    EVALUATE_ANSWER: '/api/questions/evaluate',
  } as const,
} as { BASE_URL: string; ENDPOINTS: Readonly<Record<string, string>> };

export const API_TIMEOUT = 10000; // ms

export function setApiBaseUrl(url: string) {
  if (!url) return;
  API_CONFIG.BASE_URL = url;
}
