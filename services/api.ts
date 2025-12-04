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

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO string
}

class ApiService {
  private api: AxiosInstance;
  private rawApi: AxiosInstance;

  private dailyWs: WebSocket | null = null;
  private dailyWsListeners: Set<(items: DailyQuestion[]) => void> = new Set();
  private dailyNotificationsListeners: Set<(n: { type: string; timestamp?: string; message?: string }) => void> = new Set();
  private connectionStatusListeners: Set<(connected: boolean) => void> = new Set();
  private dailyWsParamNames = ['access_token', 'token', 'accessToken'];
  private dailyWsParamIndex = 0;
  private dailyWsReconnectAttempts = 0;
  private dailyWsReconnectTimerId: number | null = null;
  private dailyWsPingIntervalId: number | null = null;
  private shouldReconnectWs: boolean = true;

  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;
  private tokenRefreshTimerId: number | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // rawApi mirrors baseURL but has no interceptors – used for refresh calls
    this.rawApi = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[API] Initialized with baseURL:', API_CONFIG.BASE_URL);

    this.initializeTokenRefresh();

    this.api.interceptors.request.use(
      async (config) => {
        const auth = await this.getAuth();
        if (auth && auth.accessToken) {
          try {
            if (this.isTokenExpiringSoon(auth.expiresAt)) {
              await this.refreshTokenIfNeeded();
              const refreshed = await this.getAuth();
              if (refreshed?.accessToken) {
                config.headers = config.headers || {};
                (config.headers as any).Authorization = `Bearer ${refreshed.accessToken}`;
              }
            } else {
              config.headers = config.headers || {};
              (config.headers as any).Authorization = `Bearer ${auth.accessToken}`;
            }
          } catch {
            console.warn('[API] Proactive token refresh failed');
          }
        }
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and refresh-on-401
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = (error.config as any) || {};

        if (error.response?.status === 401) {
          if (originalRequest._retry) {
            await this.clearAuth();
            return Promise.reject(error);
          }

          const auth = await this.getAuth();
          if (auth?.refreshToken) {
            try {
              await this.refreshTokenIfNeeded();
              const latest = await this.getAuth();
              if (latest?.accessToken) {
                originalRequest._retry = true;
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${latest.accessToken}`;
                return this.api.request(originalRequest);
              }
            } catch (refreshErr) {
              console.warn('[API] Refresh failed after 401:', refreshErr);
              await this.clearAuth();
              return Promise.reject(error);
            }
          } else {
            await this.clearAuth();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async initializeTokenRefresh() {
    try {
      const auth = await this.getAuth();
      if (auth?.expiresAt && auth?.refreshToken) {
        console.log('[API] Initializing token refresh timer');
        this.scheduleTokenRefresh(auth.expiresAt);
      }
    } catch (err) {
      console.error('[API] Error initializing token refresh:', err);
    }
  }

  private isTokenExpiringSoon(expiresAt?: string | null, thresholdSeconds = 300) {
    if (!expiresAt) return true;
    try {
      const exp = new Date(expiresAt);
      const now = new Date();
      const diff = (exp.getTime() - now.getTime()) / 1000;
      return diff < thresholdSeconds;
    } catch {
      return true;
    }
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (this.isRefreshing) {
      if (this.refreshPromise) return this.refreshPromise;
    }

    const auth = await this.getAuth();
    if (!auth?.refreshToken) {
      console.warn('[API] No refresh token available');
      throw new Error('No refresh token available');
    }

    if (!this.isTokenExpiringSoon(auth.expiresAt)) {
      return;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        console.log('[API] Attempting token refresh');

        const resp = await this.rawApi.post<AuthResponse>(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
          refreshToken: auth.refreshToken,
        });

        if (!resp?.data?.accessToken) {
          console.error('[API] Invalid refresh response');
          await this.clearAuth();
          throw new Error('Invalid refresh response');
        }

        await this.saveAuth(resp.data);
        console.log('[API] Token refresh succeeded, new expiry:', resp.data.expiresAt);

        this.scheduleTokenRefresh(resp.data.expiresAt);

        if (this.dailyWs && this.dailyWs.readyState === WebSocket.OPEN) {
          console.log('[API] Reconnecting WebSocket with new token');
          this.stopDailyWs();
          this.startDailyWs();
        }
      } catch (err) {
        console.error('[API] Token refresh error:', err);
        await this.clearAuth();
        throw err;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private scheduleTokenRefresh(expiresAt: string) {
    if (this.tokenRefreshTimerId) {
      clearTimeout(this.tokenRefreshTimerId);
      this.tokenRefreshTimerId = null;
    }

    try {
      const exp = new Date(expiresAt);
      const now = new Date();
      const timeUntilExpiry = exp.getTime() - now.getTime();

      const refreshBuffer = 5 * 60 * 1000;
      const refreshTime = Math.max(0, timeUntilExpiry - refreshBuffer);

      console.log(`[API] Scheduling token refresh in ${Math.round(refreshTime / 1000)}s`);

      this.tokenRefreshTimerId = window.setTimeout(async () => {
        this.tokenRefreshTimerId = null;
        try {
          await this.refreshTokenIfNeeded();
        } catch (err) {
          console.error('[API] Scheduled token refresh failed:', err);
        }
      }, refreshTime);
    } catch (err) {
      console.error('[API] Error scheduling token refresh:', err);
    }
  }

  // Subscribe to connection status changes. Returns an unsubscribe function.
  subscribeConnectionStatus(listener: (connected: boolean) => void): () => void {
    this.connectionStatusListeners.add(listener);
    // If we have an active WS, immediately notify listener
    try {
      listener(!!(this.dailyWs && this.dailyWs.readyState === WebSocket.OPEN));
    } catch (err) {
      console.error('[API] Error invoking connection listener:', err);
    }
    return () => {
      this.connectionStatusListeners.delete(listener);
    };
  }

  private broadcastConnectionStatus(connected: boolean) {
    if (this.connectionStatusListeners.size === 0) return;
    for (const l of Array.from(this.connectionStatusListeners)) {
      try {
        l(connected);
      } catch (err) {
        console.error('[API] Connection listener error:', err);
      }
    }
  }

  // Subscribe to simple WebSocket notifications (connected, daily_questions_ready, etc.)
  subscribeNotifications(listener: (n: { type: string; timestamp?: string; message?: string }) => void): () => void {
    this.dailyNotificationsListeners.add(listener);

    // Return unsubscribe
    return () => {
      this.dailyNotificationsListeners.delete(listener);
    };
  }

  private broadcastNotification(n: { type: string; timestamp?: string; message?: string }) {
    if (this.dailyNotificationsListeners.size === 0) return;
    for (const l of Array.from(this.dailyNotificationsListeners)) {
      try {
        l(n);
      } catch (err) {
        console.error('[API] Notification listener error:', err);
      }
    }
  }

  // Auth storage helpers
  async saveAuth(auth: AuthResponse): Promise<void> {
    const stored: StoredAuth = {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      expiresAt: auth.expiresAt,
    };

    try {
      const json = JSON.stringify(stored);
      if (isWeb) {
        localStorage.setItem(TOKEN_KEY, json);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, json);
      }

      console.log('[API] Auth saved; scheduling token refresh');
      this.scheduleTokenRefresh(auth.expiresAt);

      try {
        if (this.dailyWs) {
          console.log('[API] Restarting WebSocket with new token');
          this.stopDailyWs();
          this.startDailyWs();
        }
      } catch (err) {
        console.error('[API] Error restarting WS after saving auth:', err);
      }

      return;
    } catch (error) {
      console.error('Error saving auth:', error);
      throw error;
    }
  }

  async getAuth(): Promise<StoredAuth | null> {
    try {
      const raw = isWeb ? localStorage.getItem(TOKEN_KEY) : await SecureStore.getItemAsync(TOKEN_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as StoredAuth;
    } catch (error) {
      console.error('Error getting auth:', error);
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const auth = await this.getAuth();
      return auth?.accessToken ?? null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async clearAuth(): Promise<void> {
    try {
      if (isWeb) {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }

      if (this.tokenRefreshTimerId) {
        clearTimeout(this.tokenRefreshTimerId);
        this.tokenRefreshTimerId = null;
      }

      console.log('[API] Auth cleared; stopping WS');
      try {
        this.stopDailyWs();
      } catch (err) {
        console.error('[API] Error stopping WS after clearing auth:', err);
      }
      return;
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  async clearToken(): Promise<void> {
    return this.clearAuth();
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
        await this.saveAuth(response.data);
        console.log('[API] Auth saved to secure storage');
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
        await this.saveAuth(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    console.log('[API] Logout started');
    const auth = await this.getAuth();
    console.log('[API] Token exists before logout:', auth?.accessToken ? 'YES' : 'NO');

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
      // Continue to clear auth even if API call fails
    } finally {
      console.log('[API] Clearing auth from storage');
      await this.clearAuth();
      console.log('[API] Auth cleared from storage');
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
    this.rawApi.defaults.baseURL = url;
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

    // Enable reconnection when starting
    this.shouldReconnectWs = true;

    try {
      this.getToken().then(async (token) => {
        const base = API_CONFIG.BASE_URL || '';
        if (!base) {
          console.warn('[API] Cannot start WS: API base URL not set');
          return;
        }

        // Don't attempt to connect if there's no token — server will 401
        if (!token) {
          console.warn('[API] No auth token available for WS; deferring WS start until token is present');
          // Only schedule reconnect if we should reconnect and there are active listeners
          if (this.shouldReconnectWs && this.dailyWsListeners.size > 0) {
            this.scheduleDailyWsReconnect();
          } else {
            console.log('[API] Not scheduling WS reconnect (shouldReconnect:', this.shouldReconnectWs, 'listeners:', this.dailyWsListeners.size, ')');
          }
          return;
        }

        // Validate token via REST before attempting WebSocket handshake to avoid 401 on upgrade
        try {
          await this.getUserProfile();
          console.log('[API] Token validated via REST; proceeding with WS handshake');
        } catch (err) {
          console.error('[API] Token validation failed before WS handshake:', err);
          // Broadcast a notification so UI can show a helpful message
          try { this.broadcastNotification({ type: 'ws_auth_failed', message: 'WebSocket auth failed (token invalid)' }); } catch {}
          // Only schedule reconnect if we should reconnect and have listeners
          if (this.shouldReconnectWs && this.dailyWsListeners.size > 0) {
            this.scheduleDailyWsReconnect();
          }
          return;
        }

        // If we have a token, attempt to decode and log helpful info for debugging
        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payloadB64 = parts[1];
              let payloadJson = '';
              if (typeof atob === 'function') {
                payloadJson = decodeURIComponent(escape(atob(payloadB64)));
              } else if (typeof Buffer !== 'undefined') {
                payloadJson = Buffer.from(payloadB64, 'base64').toString('utf8');
              }
              const payload = JSON.parse(payloadJson || '{}');
              const sub = payload.sub ?? payload.userId ?? null;
              const exp = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
              console.log('[API] WS token info: sub=', sub, 'exp=', exp);
              if (exp && new Date(exp) < new Date()) {
                console.warn('[API] WS token appears expired:', exp);
              }
            }
          } catch (err) {
            console.debug('[API] Failed to decode WS token payload:', err);
          }
        }

        // Convert http(s) to ws(s)
        const wsBase = base.replace(/^http/, 'ws');
        const wsPath = API_CONFIG.ENDPOINTS.WS_DAILY_QUESTIONS || '/ws/dailyquestions';
        // Send token as access_token query parameter per backend contract
        // try configured param name (may be rotated on failures)
        const paramName = this.dailyWsParamNames[this.dailyWsParamIndex] || 'access_token';
        const tokenQuery = `?${paramName}=${encodeURIComponent(token)}`;
        const url = `${wsBase}${wsPath}${tokenQuery}`;

        // Log URL but mask token value for security
        const safeUrl = url.replace(/(access_token|token|accessToken)=([^&]+)/, `$1=****`);
        console.log('[API] Starting daily questions WS at:', safeUrl);

        try {
          this.dailyWs = new WebSocket(url);
        } catch (err) {
          console.error('[API] WebSocket constructor failed:', err);
          if (this.shouldReconnectWs && this.dailyWsListeners.size > 0) {
            this.scheduleDailyWsReconnect();
          }
          return;
        }

        // Track whether this connection ever reached open state
        let opened = false;

        this.dailyWs.onopen = () => {
          console.log('[API] Daily questions WS connected');
          this.dailyWsReconnectAttempts = 0;
          opened = true;
          // reset param index on success
          this.dailyWsParamIndex = 0;

          // broadcast connection up
          try {
            this.broadcastConnectionStatus(true);
          } catch (err) {
            console.error('[API] Error broadcasting connection status:', err);
          }

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
              // broadcast lightweight connected notification
              try {
                this.broadcastNotification({ type: 'connected', timestamp: data.timestamp, message: data.message });
              } catch (err) {
                console.error('[API] Error broadcasting connected notification:', err);
              }
               return;
             }

             if (data.type === 'daily_questions_ready') {
               console.log('[API] Daily questions ready notification received');
              // broadcast a lightweight notification first
              try {
                this.broadcastNotification({ type: 'daily_questions_ready', timestamp: data.timestamp });
              } catch (err) {
                console.error('[API] Error broadcasting daily_questions_ready notification:', err);
              }
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
          try {
            this.broadcastNotification({ type: 'ws_error', message: 'WebSocket error occurred' });
          } catch (err) {
            console.error('[API] Error broadcasting ws_error notification:', err);
          }
        };

        this.dailyWs.onclose = (ev) => {
          console.warn('[API] Daily questions WS closed', ev.code, ev.reason);
          this.dailyWs = null;
           // clear heartbeat
           if (this.dailyWsPingIntervalId) {
             clearInterval(this.dailyWsPingIntervalId);
             this.dailyWsPingIntervalId = null;
           }
           // broadcast connection down
           try {
             this.broadcastConnectionStatus(false);
           } catch (err) {
             console.error('[API] Error broadcasting connection status:', err);
           }
           // If the socket never opened (likely 401 on handshake), try next param name on next reconnect
           if (!opened) {
             this.dailyWsParamIndex = (this.dailyWsParamIndex + 1) % this.dailyWsParamNames.length;
             console.warn('[API] WS handshake did not complete; will try next token param name:', this.dailyWsParamNames[this.dailyWsParamIndex]);
           }
           // Only reconnect if flag is set and we have listeners
           if (this.shouldReconnectWs && this.dailyWsListeners.size > 0) {
             this.scheduleDailyWsReconnect();
           } else {
             console.log('[API] Not scheduling WS reconnect after close (shouldReconnect:', this.shouldReconnectWs, 'listeners:', this.dailyWsListeners.size, ')');
           }
         };
      }).catch(err => {
         console.error('[API] Failed to get token for WS:', err);
         if (this.shouldReconnectWs && this.dailyWsListeners.size > 0) {
           this.scheduleDailyWsReconnect();
         }
       });
     } catch (err) {
       console.error('[API] startDailyWs error:', err);
       if (this.shouldReconnectWs && this.dailyWsListeners.size > 0) {
         this.scheduleDailyWsReconnect();
       }
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
    console.log('[API] Stopping daily WS');
    // Disable reconnection
    this.shouldReconnectWs = false;

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
