import { useEffect, ReactNode } from 'react';
import { useLoadUser } from '@/stores/auth-store';

interface AuthInitializerProps {
  children: ReactNode;
}

/**
 * Initializes auth state by loading user from storage on mount
 * Follows the Chatwoot pattern for auth initialization
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const loadUser = useLoadUser();

  useEffect(() => {
    console.log('[AuthInitializer] Mounted, loading user');
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}

