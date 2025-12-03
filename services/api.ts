import axios, { AxiosInstance, AxiosError, isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_CONFIG, API_TIMEOUT, setApiBaseUrl } from '@/constants/api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';
import type { UpdateUserDto } from '@/types/auth';
import { Project } from '@/types/project';
import { DailyQuestion } from '@/types/question';

const TOKEN_KEY = 'auth_token';

// Use SecureStore on native platforms, localStorage on web
const isWeb = Platform.OS === 'web';

class ApiService {
  private api: AxiosInstance;

  // Real-time daily questions WebSocket manager
  private dailyWs: WebSocket | null = null;
  private dailyWsListeners: Set<(items: DailyQuestion[]) => void> = new Set();
  private dailyWsReconnectAttempts = 0;
  private dailyWsReconnectTimerId: number | null = null;
  private dailyWsPingIntervalId: number | null = null; // heartbeat ping interval id

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[API] Initialized with baseURL:', API_CONFIG.BASE_URL);

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
      if (isAxiosError(error)) {
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

  // Update current user's profile (name, OpenAI key, preferred project id)
  async updateUser(dto: UpdateUserDto): Promise<User> {
    try {
      console.log('[API] Updating user profile', dto);
      const response = await this.api.put<User>(API_CONFIG.ENDPOINTS.USER_PROFILE_UPDATE, dto);
      console.log('[API] User profile updated');
      return response.data;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw this.handleError(error);
    }
  }

  // Projects endpoints
  async getProjects(): Promise<Project[]> {
    try {
      console.log('[API] Fetching projects');
      const response = await this.api.get<Project[]>(API_CONFIG.ENDPOINTS.PROJECTS);
      console.log('[API] Projects fetched:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Get projects error:', error);
      throw this.handleError(error);
    }
  }

  // Daily Questions endpoints
  async getDailyQuestions(): Promise<DailyQuestion[]> {
    try {
      console.log('[API] Fetching daily questions');
      const response = await this.api.get<DailyQuestion[]>(API_CONFIG.ENDPOINTS.DAILY_QUESTIONS);
      console.log('[API] Daily questions fetched:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Get daily questions error:', error);
      throw this.handleError(error);
    }
  }

  // Audio transcription endpoint - sends audio to backend for Whisper processing
  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      console.log('[API] Transcribing audio via backend:', audioUri);

      const formData = new FormData();

      // Determine the correct MIME type based on the file extension
      const fileExtension = audioUri.split('.').pop()?.toLowerCase();
      let mimeType = 'audio/m4a'; // Default for iOS

      if (fileExtension === 'wav') {
        mimeType = 'audio/wav';
      } else if (fileExtension === 'mp3') {
        mimeType = 'audio/mpeg';
      } else if (fileExtension === 'webm') {
        mimeType = 'audio/webm';
      }

      // Create file object for upload
      const file = {
        uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
        type: mimeType,
        name: `recording.${fileExtension || 'm4a'}`,
      } as any;

      formData.append('file', file);

      const response = await this.api.post<{ transcript: string }>(
        API_CONFIG.ENDPOINTS.TRANSCRIBE_AUDIO,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds for audio processing
        }
      );

      console.log('[API] Transcription complete:', response.data.transcript);
      return response.data.transcript;
    } catch (error) {
      console.error('Transcribe audio error:', error);
      throw this.handleError(error);
    }
  }

  // Evaluate answer - sends question and transcript to backend for grading
  async evaluateAnswer(questionId: string, questionText: string, transcript: string): Promise<{
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    score: number;
    feedback: string;
    correctAnswer?: string;
  }> {
    try {
      console.log('[API] Evaluating answer for question:', questionId);

      const response = await this.api.post(
        API_CONFIG.ENDPOINTS.EVALUATE_ANSWER,
        {
          questionId,
          questionText,
          userAnswer: transcript,
        },
        {
          timeout: 30000, // 30 seconds for AI evaluation
        }
      );

      console.log('[API] Evaluation complete:', response.data);
      return response.data;
    } catch (error) {
      console.error('Evaluate answer error:', error);
      throw this.handleError(error);
    }
  }

  // New: allow updating base URL at runtime
  setBaseUrl(url: string) {
    if (!url) return;
    setApiBaseUrl(url);
    this.api.defaults.baseURL = url;
    console.log('[API] Base URL updated to:', url);
  }

  // Subscribe to real-time daily questions. Returns an unsubscribe function.
  subscribeDailyQuestions(listener: (items: DailyQuestion[]) => void): () => void {
    this.dailyWsListeners.add(listener);

    // Start the WebSocket connection when the first listener subscribes
    if (this.dailyWsListeners.size === 1) {
      this.startDailyWs();
    }

    return () => {
      this.dailyWsListeners.delete(listener);
      // Stop the WS when no listeners remain
      if (this.dailyWsListeners.size === 0) {
        this.stopDailyWs();
      }
    };
  }

  // Internal: start the daily questions WebSocket
  private startDailyWs() {
    if (this.dailyWs) return; // already running

    try {
      this.getToken().then((token) => {
        const base = API_CONFIG.BASE_URL || '';
        if (!base) {
          console.warn('[API] Cannot start WS: API base URL not set');
          return;
        }

        // Convert http(s) to ws(s)
        const wsBase = base.replace(/^http/, 'ws');
        const wsPath = API_CONFIG.ENDPOINTS.WS_DAILY_QUESTIONS || '/ws/dailyquestions';
        // backend expects the token as access_token query param
        const tokenQuery = token ? `?access_token=${encodeURIComponent(token)}` : '';
        const url = `${wsBase}${wsPath}${tokenQuery}`;

        console.log('[API] Starting daily questions WS at:', url);

        try {
          this.dailyWs = new WebSocket(url);
        } catch (err) {
          console.error('[API] WebSocket constructor failed:', err);
          this.scheduleDailyWsReconnect();
          return;
        }

        this.dailyWs.onopen = () => {
          console.log('[API] Daily questions WS connected');
          this.dailyWsReconnectAttempts = 0;

          // start heartbeat ping every 30s
          try {
            if (this.dailyWsPingIntervalId) {
              clearInterval(this.dailyWsPingIntervalId);
              this.dailyWsPingIntervalId = null;
            }
            this.dailyWsPingIntervalId = window.setInterval(() => {
              try {
                if (this.dailyWs && this.dailyWs.readyState === WebSocket.OPEN) {
                  this.dailyWs.send(JSON.stringify({ type: 'ping' }));
                }
              } catch (err) {
                console.error('[API] Error sending WS ping:', err);
              }
            }, 30000);
          } catch (err) {
            console.error('[API] Failed to start WS ping interval:', err);
          }
        };

        this.dailyWs.onmessage = async (ev) => {
          try {
            const data = JSON.parse(ev.data as string);
            if (!data) return;

            // Backend message types: 'connected', 'daily_questions_ready', 'pong'
            if (data.type === 'connected') {
              console.log('[API] Daily WS connected confirmation:', data.message ?? data);
              return;
            }

            if (data.type === 'daily_questions_ready') {
              console.log('[API] Daily questions ready notification received');
              // Fetch the latest daily questions from the API and broadcast to listeners
              try {
                const items = await this.getDailyQuestions();
                this.broadcastDailyQuestions(items);
              } catch (err) {
                console.error('[API] Failed to fetch daily questions after WS notification:', err);
              }

              return;
            }

            if (data.type === 'pong') {
              // keep-alive response
              return;
            }

            // Support a direct payload containing items (for future compatibility)
            if (Array.isArray(data)) {
              this.broadcastDailyQuestions(data as DailyQuestion[]);
            } else if (data.items && Array.isArray(data.items)) {
              this.broadcastDailyQuestions(data.items as DailyQuestion[]);
            } else {
              console.debug('[API] Unrecognized WS message:', data);
            }
          } catch (err) {
            console.error('[API] Error parsing WS message:', err);
          }
        };

        this.dailyWs.onerror = (ev) => {
          console.error('[API] Daily questions WS error:', ev);
        };

        this.dailyWs.onclose = (ev) => {
          console.warn('[API] Daily questions WS closed', ev.code, ev.reason);
          this.dailyWs = null;
          // clear heartbeat
          if (this.dailyWsPingIntervalId) {
            clearInterval(this.dailyWsPingIntervalId);
            this.dailyWsPingIntervalId = null;
          }
          this.scheduleDailyWsReconnect();
        };
      }).catch(err => {
        console.error('[API] Failed to get token for WS:', err);
        this.scheduleDailyWsReconnect();
      });
    } catch (err) {
      console.error('[API] startDailyWs error:', err);
      this.scheduleDailyWsReconnect();
    }
  }

  private broadcastDailyQuestions(items: DailyQuestion[]) {
    if (this.dailyWsListeners.size === 0) return;
    for (const l of Array.from(this.dailyWsListeners)) {
      try {
        l(items);
      } catch (err) {
        console.error('[API] Listener error while broadcasting daily questions:', err);
      }
    }
  }

  private scheduleDailyWsReconnect() {
    if (this.dailyWsReconnectTimerId) return;

    this.dailyWsReconnectAttempts += 1;
    const base = 1000; // 1s
    const max = 30000; // 30s
    const exp = Math.min(max, base * Math.pow(2, this.dailyWsReconnectAttempts));
    const delay = Math.floor(exp * (0.75 + Math.random() * 0.5));

    console.log(`[API] Scheduling WS reconnect in ${delay}ms (attempt ${this.dailyWsReconnectAttempts})`);

    this.dailyWsReconnectTimerId = window.setTimeout(() => {
      this.dailyWsReconnectTimerId = null;
      this.startDailyWs();
    }, delay);
  }

  private stopDailyWs() {
    if (this.dailyWs) {
      try {
        this.dailyWs.close();
      } catch (err) {
        console.error('[API] Error closing daily WS:', err);
      }
      this.dailyWs = null;
    }

    if (this.dailyWsReconnectTimerId) {
      clearTimeout(this.dailyWsReconnectTimerId);
      this.dailyWsReconnectTimerId = null;
    }

    if (this.dailyWsPingIntervalId) {
      clearInterval(this.dailyWsPingIntervalId);
      this.dailyWsPingIntervalId = null;
    }

    this.dailyWsReconnectAttempts = 0;
  }

  // Error handler
  private handleError(error: any): Error {
    if (isAxiosError(error)) {
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
