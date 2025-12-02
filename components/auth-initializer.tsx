import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Constants from 'expo-constants';
import { apiService } from '@/services/api';
import { whisperService } from '@/services/whisper-service';

interface AuthInitializerProps {
  children: ReactNode;
}

/**
 * Initializes auth state by loading user from storage on mount
 * Also applies runtime API base URL override (if provided via env or expo extra)
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const { loadUser, user } = useAuth();

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

  // Set OpenAI API key when user is loaded
  useEffect(() => {
    // If we need to support client-side key usage in future, implement a secure flow
    // to set it here. For now, do nothing.
  }, [user]);

  return <>{children}</>;
}
