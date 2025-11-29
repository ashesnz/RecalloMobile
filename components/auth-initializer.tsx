import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface AuthInitializerProps {
  children: ReactNode;
}

/**
 * Initializes auth state by loading user from storage on mount
 * Replaces the old AuthProvider component
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const loadUser = useAuthStore(state => state.loadUser);

  useEffect(() => {
    console.log('[AuthInitializer] Mounted, loading user');
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}

