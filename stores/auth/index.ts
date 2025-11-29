import { create } from 'zustand';
import type { AuthState } from './auth-types';
import { createAuthActions, type AuthActions } from './auth-actions';
import * as authSelectors from './auth-selectors';

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  uiFlags: {
    isLoggingIn: false,
    isRegistering: false,
    isLoadingUser: false,
  },
  error: null,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,
  ...createAuthActions(set, get),
}));

// Export selectors for use in components
export const useAuthSelectors = () => {
  const state = useAuthStore();
  return {
    user: authSelectors.selectUser(state),
    token: authSelectors.selectToken(state),
    isLoggingIn: authSelectors.selectIsLoggingIn(state),
    isRegistering: authSelectors.selectIsRegistering(state),
    isLoadingUser: authSelectors.selectIsLoadingUser(state),
    isLoading: authSelectors.selectIsLoading(state),
    error: authSelectors.selectAuthError(state),
    isAuthenticated: authSelectors.selectIsAuthenticated(state),
    userId: authSelectors.selectUserId(state),
    userEmail: authSelectors.selectUserEmail(state),
    userName: authSelectors.selectUserName(state),
  };
};

// Export individual selector hooks for performance
export const useUser = () => useAuthStore(authSelectors.selectUser);
export const useToken = () => useAuthStore(authSelectors.selectToken);
export const useIsLoggingIn = () => useAuthStore(authSelectors.selectIsLoggingIn);
export const useIsRegistering = () => useAuthStore(authSelectors.selectIsRegistering);
export const useIsLoadingUser = () => useAuthStore(authSelectors.selectIsLoadingUser);
export const useIsLoading = () => useAuthStore(authSelectors.selectIsLoading);
export const useAuthError = () => useAuthStore(authSelectors.selectAuthError);
export const useIsAuthenticated = () => useAuthStore(authSelectors.selectIsAuthenticated);
export const useUserId = () => useAuthStore(authSelectors.selectUserId);
export const useUserEmail = () => useAuthStore(authSelectors.selectUserEmail);
export const useUserName = () => useAuthStore(authSelectors.selectUserName);

// Export actions
export const useLogin = () => useAuthStore((state) => state.login);
export const useRegister = () => useAuthStore((state) => state.register);
export const useLogout = () => useAuthStore((state) => state.logout);
export const useLoadUser = () => useAuthStore((state) => state.loadUser);
export const useClearError = () => useAuthStore((state) => state.clearError);
export const useResetAuth = () => useAuthStore((state) => state.resetAuth);

