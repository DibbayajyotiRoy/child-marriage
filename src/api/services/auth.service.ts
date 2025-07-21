import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Person } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

// This should match the LoginResponseDTO from your backend
export interface LoginResponse {
  message: string;
  userId: string; // The backend returns the user's UUID
}

class AuthService extends BaseApiService {
  /**
   * Calls the backend's /auth/login endpoint.
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>(endpoints.auth.login(), request);
  }
}

export const authService = new AuthService();