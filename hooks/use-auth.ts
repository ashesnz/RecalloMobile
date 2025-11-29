import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
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
    console.log('[Auth] Logout started');

    // Call logout API to clear server-side session
    try {
      await AuthService.logout();
      console.log('[Auth] Logout API completed');
    } catch (error) {
      console.error('[Auth] Logout API error (non-critical):', error);
      await AuthService.clearToken();
    }

    // Dispatch logout action which will clear Redux state via rootReducer
    dispatch(logout());
    console.log('[Auth] Logout completed - state cleared');
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

