import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_CONFIG, API_TIMEOUT } from '@/constants/api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';

const TOKEN_KEY = 'auth_token';

// Use SecureStore on native platforms, localStorage on web
const isWeb = Platform.OS === 'web';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Log all outgoing requests for debugging
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  async saveToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return localStorage.getItem(TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async clearToken(): Promise<void> {
    try {
      if (isWeb) {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('[API] Login request:', { email: credentials.email });
      const response = await this.api.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        credentials
      );

      console.log('[API] Login response:', JSON.stringify(response.data, null, 2));
      console.log('[API] AccessToken:', response.data.accessToken ? 'exists' : 'missing');

      if (response.data.accessToken) {
        await this.saveToken(response.data.accessToken);
        console.log('[API] Token saved to secure storage');
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.REGISTER,
        credentials
      );

      if (response.data.accessToken) {
        await this.saveToken(response.data.accessToken);
      }

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    console.log('[API] Logout started');
    const token = await this.getToken();
    console.log('[API] Token exists before logout:', token ? 'YES' : 'NO');

    try {
      console.log('[API] Calling logout endpoint:', API_CONFIG.ENDPOINTS.LOGOUT);
      const response = await this.api.post(API_CONFIG.ENDPOINTS.LOGOUT);
      console.log('[API] Logout endpoint responded:', response.status, response.statusText);
    } catch (error) {
      console.error('[API] Logout API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('[API] Logout error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
      }
      // Continue to clear token even if API call fails
    } finally {
      console.log('[API] Clearing token from storage');
      await this.clearToken();
      console.log('[API] Token cleared from storage');
    }
  }

  async getUserProfile(): Promise<User> {
    try {
      const response = await this.api.get<User>(API_CONFIG.ENDPOINTS.USER_PROFILE);
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;

      if (axiosError.response) {
        // Server responded with error
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message || 'An error occurred';
        const errorWithStatus = new Error(message);
        // Attach status code to error object for better handling
        (errorWithStatus as any).status = status;
        (errorWithStatus as any).statusText = axiosError.response.statusText;
        return errorWithStatus;
      } else if (axiosError.request) {
        // Request made but no response
        return new Error('Unable to connect to server. Please check your connection.');
      }
    }

    return new Error('An unexpected error occurred');
  }
}

export const apiService = new ApiService();

