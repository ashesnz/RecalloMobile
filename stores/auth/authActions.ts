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
};



