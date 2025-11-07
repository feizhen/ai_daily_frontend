import { apiClient } from '../utils/apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nickname?: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Login user with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/login', credentials);
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/register', data);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  return apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
}

/**
 * Logout user
 */
export async function logout(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await apiClient.post('/auth/logout', { refreshToken }, { requiresAuth: true });
  } catch (error) {
    // Ignore logout errors, clear local storage anyway
    console.error('Logout error:', error);
  }
}

/**
 * Get current user profile
 */
export async function getUserProfile(accessToken: string): Promise<User> {
  const result = await apiClient.get<{ success: boolean; data: User }>(
    '/auth/profile',
    { requiresAuth: true }
  );
  return result.data;
}
