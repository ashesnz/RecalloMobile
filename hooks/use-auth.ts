import { useAuthStore } from '@/stores/auth-store';

/**
 * Custom hook to access auth state and actions
 * This is a convenience wrapper around useAuthStore
 */
export function useAuth() {
  return useAuthStore();
}

