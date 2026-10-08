import { apiClient, ApiResponse } from './client';

export type UserRole = 'ADMIN' | 'MANAGEMENT' | 'SUPERVISOR' | 'OPERATOR';

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export const authApi = {
  async login(username: string, password: string): Promise<LoginResult> {
    const response = await apiClient.post<ApiResponse<LoginResult>>('/auth/login', {
      username,
      password,
    });
    return response.data.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch {
        // Abaikan error pada logout jaringan
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
  },

  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/me');
    return response.data.data;
  },
};
