import {
  useAuthSelectors,
  useLogin,
  useRegister,
  useLogout,
  useLoadUser,
  useClearError,
  useResetAuth,
} from '@/stores/auth-store';

/**
 * Custom hook to access auth state and actions
 * This provides a unified interface following the Chatwoot pattern
 */
export function useAuth() {
  const selectors = useAuthSelectors();
  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();
  const loadUser = useLoadUser();
  const clearError = useClearError();
  const resetAuth = useResetAuth();

  return {
    // State
    user: selectors.user,
    token: selectors.token,
    isAuthenticated: selectors.isAuthenticated,
    isLoading: selectors.isLoading,
    isLoggingIn: selectors.isLoggingIn,
    isRegistering: selectors.isRegistering,
    isLoadingUser: selectors.isLoadingUser,
    error: selectors.error,
    userId: selectors.userId,
    userEmail: selectors.userEmail,
    userName: selectors.userName,

    // Actions
    login,
    register,
    logout,
    loadUser,
    clearError,
    resetAuth,
  };
}

