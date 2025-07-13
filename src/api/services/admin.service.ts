
import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: {
    id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'admin';
  };
  token: string;
}

export class AdminService extends BaseApiService {
  async login(request: AdminLoginRequest): Promise<AdminLoginResponse> {
    return this.post<AdminLoginResponse>(endpoints.admin.login(), request);
  }
}

export const adminService = new AdminService();
