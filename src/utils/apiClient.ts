/**
 * Unified API client with automatic authentication and token refresh
 */

const API_BASE = '/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

const ACCESS_TOKEN_KEY = 'ai_daily_access_token';
const REFRESH_TOKEN_KEY = 'ai_daily_refresh_token';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Add callback to refresh subscribers
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers with new token
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const result = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = result.data;

    // Update tokens in localStorage
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

    return accessToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear auth data on refresh failure
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('ai_daily_user');
    return null;
  }
}

/**
 * Get current access token from localStorage
 */
function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
  skipAuthRefresh?: boolean;
}

/**
 * Unified fetch function with authentication and timeout
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    requiresAuth = false,
    skipAuthRefresh = false,
    headers = {},
    ...fetchOptions
  } = options;

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    // Build headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = getAccessToken();
      if (token) {
        (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    // Make request
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requiresAuth && !skipAuthRefresh) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onTokenRefreshed(newToken);
          // Retry original request with new token
          return apiFetch<T>(endpoint, { ...options, skipAuthRefresh: true });
        } else {
          // Redirect to login or throw error
          throw new Error('Session expired. Please login again.');
        }
      } else {
        // Wait for token refresh to complete
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            apiFetch<T>(endpoint, { ...options, skipAuthRefresh: true })
              .then(resolve)
              .catch(reject);
          });
        });
      }
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    // Parse and return response
    // Handle 204 No Content or empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true } as T;
    }

    const text = await response.text();
    if (!text) {
      return { success: true } as T;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn('Failed to parse response as JSON:', text);
      return { success: true, data: text } as T;
    }
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }

    throw new Error('Unknown error occurred');
  }
}

/**
 * Convenience methods for different HTTP methods
 */
export const apiClient = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
