import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { LoginCredentials, RegisterCredentials, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUser = async () => {
    try {
      console.log('[Auth] loadUser called');
      setState(prev => ({ ...prev, isLoading: true }));

      const token = await apiService.getToken();
      console.log('[Auth] Token from storage:', token ? 'exists' : 'null');

      if (token) {
        console.log('[Auth] Token exists, fetching user profile');
        const user = await apiService.getUserProfile();
        setState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
        console.log('[Auth] User loaded successfully:', user.email);
      } else {
        console.log('[Auth] No token found, setting unauthenticated state');
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('[Auth] Load user error:', error);
      // Clear invalid token
      await apiService.clearToken();
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  // Load user on mount only
  useEffect(() => {
    console.log('[Auth] AuthProvider mounted, loading user');
    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[Auth] Login started');
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await apiService.login(credentials);
      console.log('[Auth] Login API successful');

      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      });
      console.log('[Auth] State updated - authenticated');
      return { success: true };
    } catch (error: any) {
      console.log('[Auth] Login failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      console.log('[Auth] State updated - not authenticated');

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
  };

  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await apiService.register(credentials);

      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));

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
  };

  const logout = async () => {
    console.log('[Auth] Logout started');
    console.log('[Auth] Current state before logout:', { isAuthenticated: state.isAuthenticated, user: state.user?.email });

    // Set loading state immediately
    setState(prev => {
      console.log('[Auth] Setting isLoading to true');
      return { ...prev, isLoading: true };
    });

    // Call logout API (which will clear token in its finally block)
    try {
      await apiService.logout();
      console.log('[Auth] Logout API completed successfully');
    } catch (error) {
      console.error('[Auth] Logout API error (non-critical):', error);
      // Ensure token is cleared even if API call fails
      await apiService.clearToken();
    }

    // Always clear the auth state - this is what triggers the UI to show login screen
    console.log('[Auth] Clearing authentication state');
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    console.log('[Auth] Logout completed - state set to unauthenticated');
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

