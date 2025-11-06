import { fetchWithTimeout } from './home';

const API_BASE = '/api';

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
  const response = await fetchWithTimeout(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '登录失败');
  }

  return response.json();
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetchWithTimeout(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '注册失败');
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  const response = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '令牌刷新失败');
  }

  return response.json();
}

/**
 * Logout user
 */
export async function logout(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await fetchWithTimeout(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    // Ignore logout errors, clear local storage anyway
    console.error('Logout error:', error);
  }
}

/**
 * Get current user profile
 */
export async function getUserProfile(accessToken: string): Promise<User> {
  const response = await fetchWithTimeout(`${API_BASE}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取用户信息失败');
  }

  const result = await response.json();
  return result.data;
}
