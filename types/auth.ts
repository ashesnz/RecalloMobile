export interface User {
  id: string;
  email: string;
  name: string;
  preferredProjectId?: string | null;
  openAiKey?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface UpdateUserDto {
  name?: string | null;
  openAiKey?: string | null;
  preferredProjectId?: string | null;
}
