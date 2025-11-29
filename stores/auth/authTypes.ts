import type { User } from '@/types/auth';


export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface ProfileResponse {
  user: User;
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  uiFlags: {
    isLoggingIn: boolean;
    isRegistering: boolean;
    isLoadingUser: boolean;
  };
  error: string | null;
}

