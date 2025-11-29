import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/auth';
import type { AuthState, LoginResponse, RegisterResponse, ProfileResponse } from './authTypes';

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

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: () => {
      // Handled in rootReducer in store/store.ts
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.uiFlags = {
        isLoggingIn: false,
        isRegistering: false,
        isLoadingUser: false,
      };
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    // Async action handlers
    loginPending: (state) => {
      state.uiFlags.isLoggingIn = true;
      state.error = null;
    },
    loginFulfilled: (state, action: PayloadAction<LoginResponse>) => {
      console.log('[AuthSlice] loginFulfilled payload:', JSON.stringify(action.payload, null, 2));
      console.log('[AuthSlice] AccessToken from payload:', action.payload.accessToken ? 'exists' : 'missing');
      // Store the access token
      state.token = action.payload.accessToken;
      console.log('[AuthSlice] State after update - token:', state.token ? 'exists' : 'missing');
      state.uiFlags.isLoggingIn = false;
      state.error = null;
      // Note: user will be loaded separately via getProfile action
    },
    loginRejected: (state, action: PayloadAction<string | undefined>) => {
      state.uiFlags.isLoggingIn = false;
      state.error = action.payload ?? 'Login failed';
    },
    registerPending: (state) => {
      state.uiFlags.isRegistering = true;
      state.error = null;
    },
    registerFulfilled: (state, action: PayloadAction<RegisterResponse>) => {
      state.token = action.payload.accessToken;
      state.uiFlags.isRegistering = false;
      state.error = null;
      // Note: user will be loaded separately via getProfile action
    },
    registerRejected: (state, action: PayloadAction<string | undefined>) => {
      state.uiFlags.isRegistering = false;
      state.error = action.payload ?? 'Registration failed';
    },
    getProfilePending: (state) => {
      state.uiFlags.isLoadingUser = true;
    },
    getProfileFulfilled: (state, action: PayloadAction<ProfileResponse>) => {
      state.user = {
        ...state.user,
        ...action.payload.user,
      } as User;
      state.uiFlags.isLoadingUser = false;
    },
    getProfileRejected: (state) => {
      state.uiFlags.isLoadingUser = false;
    },
  },
});

export const {
  logout,
  resetAuth,
  clearAuthError,
  setUser,
  loginPending,
  loginFulfilled,
  loginRejected,
  registerPending,
  registerFulfilled,
  registerRejected,
  getProfilePending,
  getProfileFulfilled,
  getProfileRejected,
} = authSlice.actions;

export default authSlice.reducer;

