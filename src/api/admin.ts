import { apiClient } from '../utils/apiClient';
import type { Video, NewsItem } from '../types/api';

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

  const endpoint = `/youtube/videos${params.toString() ? `?${params.toString()}` : ''}`;
  return apiClient.get<Video[]>(endpoint);
}

/**
 * Delete a video by ID
 */
export async function deleteVideo(id: string): Promise<void> {
  await apiClient.delete(`/youtube/videos/${id}`, { requiresAuth: true });
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
  const result = await apiClient.post<{ data?: any }>(
    '/youtube/videos/sync',
    options || {},
    { requiresAuth: true }
  );
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

  const endpoint = `/news${params.toString() ? `?${params.toString()}` : ''}`;
  const result = await apiClient.get<{ data?: NewsListResponse }>(endpoint);
  return result.data || result;
}

/**
 * Update a news item
 */
export async function updateNews(id: string, data: Partial<NewsItem>): Promise<NewsItem> {
  const result = await apiClient.patch<{ data?: NewsItem }>(
    `/news/${id}`,
    data,
    { requiresAuth: true }
  );
  return result.data || result;
}

/**
 * Delete a news item
 */
export async function deleteNews(id: string): Promise<void> {
  await apiClient.delete(`/news/${id}`, { requiresAuth: true });
}

/**
 * Sync news from all email sources
 */
export async function syncAllNews(maxResults?: number): Promise<{
  totalEmails: number;
  newItems: number;
  duplicates: number;
}> {
  const result = await apiClient.post<{ data: any }>(
    '/news/sync/all',
    { maxResults: maxResults || 3 },
    { requiresAuth: true }
  );
  return result.data.total || result.data;
}

/**
 * Translate pending news items
 */
export async function translatePendingNews(limit?: number): Promise<{
  translatedCount: number;
}> {
  const result = await apiClient.post<{ data?: any }>(
    '/news/translate/pending',
    { limit: limit || 50 },
    { requiresAuth: true }
  );
  return result.data || result;
}
