import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { persistor } from '@/stores/store';
import { authActions } from '@/stores/auth/authActions';
import { logout, clearAuthError } from '@/stores/auth/authSlice';
import { AuthService } from '@/stores/auth/authService';
import {
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoggingIn,
  selectIsRegistering,
  selectIsLoadingUser,
  selectIsLoading,
  selectAuthError,
  selectUserId,
  selectUserEmail,
  selectUserName,
} from '@/stores/auth/authSelectors';
import type { LoginPayload, RegisterPayload } from '@/stores/auth/authTypes';

/**
 * Custom hook to access auth state and actions
 * Following Chatwoot pattern with Redux Toolkit
 */
export function useAuth() {
  const dispatch = useAppDispatch();

  // Selectors
  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoggingIn = useAppSelector(selectIsLoggingIn);
  const isRegistering = useAppSelector(selectIsRegistering);
  const isLoadingUser = useAppSelector(selectIsLoadingUser);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  const userId = useAppSelector(selectUserId);
  const userEmail = useAppSelector(selectUserEmail);
  const userName = useAppSelector(selectUserName);

  // Actions
  const login = useCallback(
    async (credentials: LoginPayload) => {
      try {
        console.log('[Auth] Login started');
        await dispatch(authActions.login(credentials));
        console.log('[Auth] Login successful');
        return { success: true };
      } catch (error: any) {
        console.log('[Auth] Login failed:', error);
        return { success: false, error: error.errors?.[0] || 'Login failed' };
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (credentials: RegisterPayload) => {
      try {
        console.log('[Auth] Register started');
        await dispatch(authActions.register(credentials));
        console.log('[Auth] Register successful');
        return { success: true };
      } catch (error: any) {
        console.log('[Auth] Register failed:', error);
        return { success: false, error: error.errors?.[0] || 'Registration failed' };
      }
    },
    [dispatch]
  );

  const handleLogout = useCallback(async () => {
    try {
      console.log('[Auth] Logout started');

      // Step 1: Call logout action (clears server session and token from storage)
      await dispatch(authActions.logout());
      console.log('[Auth] Logout action completed');

      // Step 2: Dispatch logout reducer action to reset Redux state to initial
      dispatch(logout());
      console.log('[Auth] Redux state reset');

      // Step 3: Purge persistor to completely clear persisted state from AsyncStorage
      await persistor.purge();
      console.log('[Auth] Persistor purged');

      // Step 4: Also manually clear the persist key as backup
      try {
        await AsyncStorage.removeItem('persist:Root');
        console.log('[Auth] AsyncStorage persist key removed');
      } catch (error) {
        console.error('[Auth] Error clearing AsyncStorage:', error);
      }

      console.log('[Auth] Logout completed successfully');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      // Even if there's an error, still reset local state
      dispatch(logout());
      await persistor.purge();
      try {
        await AsyncStorage.removeItem('persist:Root');
      } catch (e) {
        console.error('[Auth] Error clearing AsyncStorage on error:', e);
      }
    }
  }, [dispatch]);

  const loadUser = useCallback(async () => {
    try {
      console.log('[Auth] loadUser called');
      const storedToken = await AuthService.getToken();
      console.log('[Auth] Token from storage:', storedToken ? 'exists' : 'null');

      if (storedToken) {
        console.log('[Auth] Token exists, fetching user profile');
        await dispatch(authActions.getProfile());
        console.log('[Auth] User loaded successfully');
      } else {
        console.log('[Auth] No token found');
      }
    } catch (error) {
      console.error('[Auth] Load user error:', error);
      // Clear invalid token
      await AuthService.clearToken();
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    console.log('[Auth] Clearing error');
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    isLoggingIn,
    isRegistering,
    isLoadingUser,
    error,
    userId,
    userEmail,
    userName,

    // Actions
    login,
    register,
    logout: handleLogout,
    loadUser,
    clearError,
  };
}

