import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface AuthInitializerProps {
  children: ReactNode;
}

/**
 * Initializes auth state by loading user from storage on mount
 * Following Chatwoot pattern with Redux Toolkit
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const { loadUser } = useAuth();

  useEffect(() => {
    console.log('[AuthInitializer] Mounted, loading user');
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}

