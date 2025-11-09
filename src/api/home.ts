import type { Video, NewsItem, DailyNewsResponse, DailyVideosResponse } from '../types/api';
import { apiClient } from '../utils/apiClient';

/**
 * Get daily YouTube video recommendations
 * Public endpoint - no authentication required
 * Uses the /youtube/videos/daily/recommendations endpoint to get today's recommended videos
 * @param limit - Number of videos to fetch (default: 2)
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 */
export const getYouTubeVideos = async (limit: number = 2, date?: string): Promise<Video[]> => {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (date) {
      params.append('date', date);
    }
    const response = await apiClient.get<DailyVideosResponse>(
      `/youtube/videos/daily/recommendations?${params.toString()}`
    );
    return response.data.videos;
  } catch (error) {
    console.error('Error fetching daily video recommendations:', error);
    throw error;
  }
};

/**
 * Get daily news recommendations
 * Public endpoint - no authentication required
 * Uses the /news/daily/recommendations endpoint to get today's news
 * @param limit - Number of news items to fetch (default: 5)
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 */
export const getTopUnpushedNews = async (limit: number = 5, date?: string): Promise<NewsItem[]> => {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (date) {
      params.append('date', date);
    }
    const data = await apiClient.get<DailyNewsResponse>(
      `/news/daily/recommendations?${params.toString()}`
    );
    return data.data.items;
  } catch (error) {
    console.error('Error fetching daily news recommendations:', error);
    throw error;
  }
};
