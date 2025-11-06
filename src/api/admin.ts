import { fetchWithTimeout } from './home';
import { getAccessToken } from '../contexts/AuthContext';
import type { Video, NewsItem } from '../types/api';

const API_BASE = '/api';

// Helper to add auth header
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ============= VIDEO APIs =============

export interface VideoFilters {
  page?: number;
  limit?: number;
  category?: string;
  minDuration?: number;
  maxDuration?: number;
  isPushed?: boolean;
  isWatched?: boolean;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface VideoListResponse {
  items: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all videos with optional filters
 */
export async function getVideos(filters?: VideoFilters): Promise<Video[]> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const url = `${API_BASE}/youtube/videos${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }

  return response.json();
}

/**
 * Delete a video by ID
 */
export async function deleteVideo(id: string): Promise<void> {
  const response = await fetchWithTimeout(`${API_BASE}/youtube/videos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete video');
  }
}

/**
 * Sync videos from YouTube channels
 */
export async function syncVideos(options?: {
  hoursAgo?: number;
  maxVideosPerChannel?: number;
  category?: string;
}): Promise<{
  totalVideos: number;
  newVideos: number;
  channels: number;
}> {
  const response = await fetchWithTimeout(`${API_BASE}/youtube/videos/sync`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(options || {}),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sync videos');
  }

  const result = await response.json();
  return result.data || result;
}

// ============= NEWS APIs =============

export interface NewsFilters {
  page?: number;
  limit?: number;
  isPushed?: boolean;
  isRead?: boolean;
  isLiked?: boolean;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface NewsListResponse {
  items: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all news with optional filters
 */
export async function getNews(filters?: NewsFilters): Promise<NewsListResponse> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const url = `${API_BASE}/news${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Update a news item
 */
export async function updateNews(id: string, data: Partial<NewsItem>): Promise<NewsItem> {
  const response = await fetchWithTimeout(`${API_BASE}/news/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update news');
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Delete a news item
 */
export async function deleteNews(id: string): Promise<void> {
  const response = await fetchWithTimeout(`${API_BASE}/news/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete news');
  }
}

/**
 * Sync news from all email sources
 */
export async function syncAllNews(maxResults?: number): Promise<{
  totalEmails: number;
  newItems: number;
  duplicates: number;
}> {
  const response = await fetchWithTimeout(`${API_BASE}/news/sync/all`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ maxResults: maxResults || 3 }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sync news');
  }

  const result = await response.json();
  return result.data.total || result.data;
}

/**
 * Translate pending news items
 */
export async function translatePendingNews(limit?: number): Promise<{
  translatedCount: number;
}> {
  const response = await fetchWithTimeout(`${API_BASE}/news/translate/pending`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ limit: limit || 50 }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to translate news');
  }

  const result = await response.json();
  return result.data || result;
}
