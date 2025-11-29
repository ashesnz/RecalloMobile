import { AuthService } from './authService';
import {
  loginPending,
  loginFulfilled,
  loginRejected,
  registerPending,
  registerFulfilled,
  registerRejected,
  getProfilePending,
  getProfileFulfilled,
  getProfileRejected,
} from './authSlice';
import type {
  LoginPayload,
  RegisterPayload,
} from './authTypes';
import { handleApiError, getErrorMessage } from './authUtils';
import type { AppDispatch } from '../store';

export const authActions = {
  login: (credentials: LoginPayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(loginPending());
      const response = await AuthService.login(credentials);
      dispatch(loginFulfilled(response));
      return { success: true, data: response };
    } catch (error) {
      const apiError = handleApiError(error, 'Login failed');
      const errorMessage = getErrorMessage(apiError);
      dispatch(loginRejected(errorMessage));
      throw apiError;
    }
  },

  register: (credentials: RegisterPayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(registerPending());
      const response = await AuthService.register(credentials);
      dispatch(registerFulfilled(response));
      return { success: true, data: response };
    } catch (error) {
      const apiError = handleApiError(error, 'Registration failed');
      const errorMessage = getErrorMessage(apiError);
      dispatch(registerRejected(errorMessage));
      throw apiError;
    }
  },

  getProfile: () => async (dispatch: AppDispatch) => {
    try {
      dispatch(getProfilePending());
      const response = await AuthService.getProfile();
      dispatch(getProfileFulfilled(response));
      return { success: true, data: response };
    } catch (error) {
      dispatch(getProfileRejected());
      throw error;
    }
  },

  logout: () => async () => {
    try {
      console.log('[AuthActions] Logout started');

      // Call logout API to clear server-side session
      try {
        await AuthService.logout();
        console.log('[AuthActions] Server logout completed');
      } catch (error) {
        console.error('[AuthActions] Server logout error (continuing with client logout):', error);
      }

      // Clear token from secure storage
      await AuthService.clearToken();
      console.log('[AuthActions] Token cleared from secure storage');

      console.log('[AuthActions] Logout action completed');
      return { success: true };
    } catch (error) {
      console.error('[AuthActions] Logout error:', error);
      // Even if there's an error, we should still clear the token
      try {
        await AuthService.clearToken();
      } catch (clearError) {
        console.error('[AuthActions] Error clearing token:', clearError);
      }
      throw error;
    }
  },
};



