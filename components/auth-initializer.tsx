import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Constants from 'expo-constants';
import { apiService } from '@/services/api';

interface AuthInitializerProps {
  children: ReactNode;
}

/**
 * Initializes auth state by loading user from storage on mount
 * Also applies runtime API base URL override (if provided via env or expo extra)
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const { loadUser } = useAuth();

  useEffect(() => {
    console.log('[AuthInitializer] Mounted, loading user');

    // Resolve runtime override for API base URL
    const runtimeBaseUrl =
      (process.env.API_BASE_URL as string | undefined) ||
      (Constants.expoConfig?.extra?.API_BASE_URL as string | undefined) ||
      ((Constants.manifest as any)?.extra?.API_BASE_URL as string | undefined);

    if (runtimeBaseUrl) {
      console.log('[AuthInitializer] Applying runtime API base URL:', runtimeBaseUrl);
      apiService.setBaseUrl(runtimeBaseUrl);
    }

    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}
