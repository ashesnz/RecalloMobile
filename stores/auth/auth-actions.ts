import type { AuthState, LoginPayload, RegisterPayload } from './auth-types';
import { AuthService } from './auth-service';
import { handleApiError, getErrorMessage } from './auth-utils';

export interface AuthActions {
  // Auth operations
  login: (credentials: LoginPayload) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;

  // State management
  clearError: () => void;
  resetAuth: () => void;
}

export const createAuthActions = (
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void,
  get: () => AuthState
): AuthActions => ({
  login: async (credentials: LoginPayload) => {
    try {
      console.log('[AuthStore] Login started');
      set({
        uiFlags: {
          isLoggingIn: true,
          isRegistering: false,
          isLoadingUser: false
        },
        error: null
      });

      const response = await AuthService.login(credentials);
      console.log('[AuthStore] Login API successful');

      set({
        user: response.user,
        token: response.token,
        uiFlags: {
          isLoggingIn: false,
          isRegistering: false,
          isLoadingUser: false
        },
        error: null,
      });
      console.log('[AuthStore] State updated - authenticated');
      return { success: true };
    } catch (error: any) {
      console.log('[AuthStore] Login failed:', error);
      const apiError = handleApiError(error, 'Login failed');
      const errorMessage = getErrorMessage(apiError);

      set({
        uiFlags: {
          isLoggingIn: false,
          isRegistering: false,
          isLoadingUser: false
        },
        error: errorMessage
      });
      console.log('[AuthStore] State updated - not authenticated');

      return { success: false, error: errorMessage };
    }
  },

  register: async (credentials: RegisterPayload) => {
    try {
      console.log('[AuthStore] Register started');
      set({
        uiFlags: {
          isLoggingIn: false,
          isRegistering: true,
          isLoadingUser: false
        },
        error: null
      });

      const response = await AuthService.register(credentials);
      console.log('[AuthStore] Register API successful');

      set({
        user: response.user,
        token: response.token,
        uiFlags: {
          isLoggingIn: false,
          isRegistering: false,
          isLoadingUser: false
        },
        error: null,
      });
      return { success: true };
    } catch (error: any) {
      console.log('[AuthStore] Register failed:', error);
      const apiError = handleApiError(error, 'Registration failed');
      const errorMessage = getErrorMessage(apiError);

      set({
        uiFlags: {
          isLoggingIn: false,
          isRegistering: false,
          isLoadingUser: false
        },
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    const state = get();
    console.log('[AuthStore] Logout started');
    console.log('[AuthStore] Current state:', {
      isAuthenticated: state.user !== null,
      user: state.user?.email
    });

    // Set loading state immediately
    set({
      uiFlags: {
        isLoggingIn: false,
        isRegistering: false,
        isLoadingUser: true
      }
    });
    console.log('[AuthStore] isLoadingUser set to true');

    // Call logout API
    try {
      await AuthService.logout();
      console.log('[AuthStore] Logout API completed successfully');
    } catch (error) {
      console.error('[AuthStore] Logout API error (non-critical):', error);
      // Ensure token is cleared even if API call fails
      await AuthService.clearToken();
    }

    // Clear the auth state
    console.log('[AuthStore] Clearing authentication state');
    set({
      user: null,
      token: null,
      uiFlags: {
        isLoggingIn: false,
        isRegistering: false,
        isLoadingUser: false
      },
      error: null,
    });
    console.log('[AuthStore] Logout completed - state set to unauthenticated');
  },

  loadUser: async () => {
    try {
      console.log('[AuthStore] loadUser called');
      set({
        uiFlags: {
          isLoggingIn: false,
          isRegistering: false,
          isLoadingUser: true
        }
      });

      const token = await AuthService.getToken();
      console.log('[AuthStore] Token from storage:', token ? 'exists' : 'null');

      if (token) {
        console.log('[AuthStore] Token exists, fetching user profile');
        const response = await AuthService.getProfile();

        set({
          user: response.user,
          token,
          uiFlags: {
            isLoggingIn: false,
            isRegistering: false,
            isLoadingUser: false
          },
          error: null,
        });
        console.log('[AuthStore] User loaded successfully:', response.user.email);
      } else {
        console.log('[AuthStore] No token found, setting unauthenticated state');
        set({
          user: null,
          token: null,
          uiFlags: {
            isLoggingIn: false,
            isRegistering: false,
            isLoadingUser: false
          },
          error: null,
        });
      }
    } catch (error) {
      console.error('[AuthStore] Load user error:', error);
      // Clear invalid token
      await AuthService.clearToken();
      set({
        user: null,
        token: null,
        uiFlags: {
          isLoggingIn: false,
          isRegistering: false,
          isLoadingUser: false
        },
        error: null,
      });
    }
  },

  clearError: () => {
    console.log('[AuthStore] Clearing error');
    set({ error: null });
  },

  resetAuth: () => {
    console.log('[AuthStore] Resetting auth state');
    set({
      user: null,
      token: null,
      uiFlags: {
        isLoggingIn: false,
        isRegistering: false,
        isLoadingUser: false
      },
      error: null,
    });
  },
});

