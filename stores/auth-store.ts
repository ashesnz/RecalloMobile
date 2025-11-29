// This file is kept for backward compatibility
// The new auth implementation is in stores/auth/

export {
  useAuthStore,
  useAuthSelectors,
  useUser,
  useToken,
  useIsLoggingIn,
  useIsRegistering,
  useIsLoadingUser,
  useIsLoading,
  useAuthError,
  useIsAuthenticated,
  useUserId,
  useUserEmail,
  useUserName,
  useLogin,
  useRegister,
  useLogout,
  useLoadUser,
  useClearError,
  useResetAuth,
} from './auth';

