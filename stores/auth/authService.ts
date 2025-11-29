import { apiService } from '@/services/api';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ProfileResponse,
} from './authTypes';

export class AuthService {
  static async login(credentials: LoginPayload): Promise<LoginResponse> {
    return await apiService.login(credentials);
  }

  static async register(credentials: RegisterPayload): Promise<RegisterResponse> {
    return await apiService.register(credentials);
  }

  static async getProfile(): Promise<ProfileResponse> {
    const user = await apiService.getUserProfile();
    return { user };
  }

  static async logout(): Promise<void> {
    await apiService.logout();
  }

  static async getToken(): Promise<string | null> {
    return await apiService.getToken();
  }

  static async clearToken(): Promise<void> {
    await apiService.clearToken();
  }
}

