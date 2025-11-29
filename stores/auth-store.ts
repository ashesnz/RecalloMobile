import { create } from 'zustand';
import { apiService } from '@/services/api';
import { LoginCredentials, RegisterCredentials, User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  setLoading: (isLoading: boolean) => {
    console.log('[AuthStore] Setting isLoading:', isLoading);
    set({ isLoading });
  },

  reset: () => {
    console.log('[AuthStore] Resetting auth state');
    set(initialState);
  },

  loadUser: async () => {
    try {
      console.log('[AuthStore] loadUser called');
      set({ isLoading: true });

      const token = await apiService.getToken();
      console.log('[AuthStore] Token from storage:', token ? 'exists' : 'null');

      if (token) {
        console.log('[AuthStore] Token exists, fetching user profile');
        const user = await apiService.getUserProfile();

        set({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
        console.log('[AuthStore] User loaded successfully:', user.email);
      } else {
        console.log('[AuthStore] No token found, setting unauthenticated state');
        set({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('[AuthStore] Load user error:', error);
      // Clear invalid token
      await apiService.clearToken();
      set({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  login: async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[AuthStore] Login started');
      set({ isLoading: true });

      const response = await apiService.login(credentials);
      console.log('[AuthStore] Login API successful');

      set({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      });
      console.log('[AuthStore] State updated - authenticated');
      return { success: true };
    } catch (error: any) {
      console.log('[AuthStore] Login failed:', error);
      set({ isLoading: false });
      console.log('[AuthStore] State updated - not authenticated');

      // Return error message instead of throwing
      const errorMessage = error.message || 'Login failed';
      const statusCode = error.status || 0;

      let displayMessage: string;
      if (statusCode === 401 || statusCode === 400) {
        displayMessage = 'The email address or password is incorrect. Please try again.';
      } else if (errorMessage.toLowerCase().includes('connect') ||
                 errorMessage.toLowerCase().includes('network') ||
                 errorMessage.toLowerCase().includes('timeout')) {
        displayMessage = 'Unable to connect to server. Please check your connection.';
      } else {
        displayMessage = errorMessage;
      }

      return { success: false, error: displayMessage };
    }
  },

  register: async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[AuthStore] Register started');
      set({ isLoading: true });

      const response = await apiService.register(credentials);
      console.log('[AuthStore] Register API successful');

      set({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error: any) {
      console.log('[AuthStore] Register failed:', error);
      set({ isLoading: false });

      // Return error message instead of throwing
      const errorMessage = error.message || 'Registration failed';
      const statusCode = error.status || 0;

      let displayMessage: string;
      if (statusCode === 400) {
        displayMessage = error.message || 'Invalid registration details. Please check your information.';
      } else if (errorMessage.toLowerCase().includes('connect') ||
                 errorMessage.toLowerCase().includes('network') ||
                 errorMessage.toLowerCase().includes('timeout')) {
        displayMessage = 'Unable to connect to server. Please check your connection.';
      } else {
        displayMessage = errorMessage;
      }

      return { success: false, error: displayMessage };
    }
  },

  logout: async () => {
    const state = get();
    console.log('[AuthStore] Logout started');
    console.log('[AuthStore] Current state:', {
      isAuthenticated: state.isAuthenticated,
      user: state.user?.email
    });

    // Set loading state immediately
    set({ isLoading: true });
    console.log('[AuthStore] isLoading set to true');

    // Call logout API (which will clear token in its finally block)
    try {
      await apiService.logout();
      console.log('[AuthStore] Logout API completed successfully');
    } catch (error) {
      console.error('[AuthStore] Logout API error (non-critical):', error);
      // Ensure token is cleared even if API call fails
      await apiService.clearToken();
    }

    // Clear the auth state - this triggers UI to show login screen
    console.log('[AuthStore] Clearing authentication state');
    set({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    console.log('[AuthStore] Logout completed - state set to unauthenticated');
  },
}));

