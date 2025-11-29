import type { AuthState } from './auth-types';

// Selectors for accessing auth state
export const selectAuth = (state: AuthState) => state;

export const selectUser = (state: AuthState) => state.user;

export const selectToken = (state: AuthState) => state.token;

export const selectIsLoggingIn = (state: AuthState) => state.uiFlags.isLoggingIn;

export const selectIsRegistering = (state: AuthState) => state.uiFlags.isRegistering;

export const selectIsLoadingUser = (state: AuthState) => state.uiFlags.isLoadingUser;

export const selectAuthError = (state: AuthState) => state.error;

export const selectIsAuthenticated = (state: AuthState) => state.user !== null && state.token !== null;

export const selectUserId = (state: AuthState) => state.user?.id;

export const selectUserEmail = (state: AuthState) => state.user?.email;

export const selectUserName = (state: AuthState) => state.user?.name;

export const selectIsLoading = (state: AuthState) =>
  state.uiFlags.isLoggingIn ||
  state.uiFlags.isRegistering ||
  state.uiFlags.isLoadingUser;

