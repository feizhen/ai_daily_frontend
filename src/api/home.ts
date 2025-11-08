import type { Video, NewsItem, DailyNewsResponse, DailyVideosResponse } from '../types/api';
import { apiClient } from '../utils/apiClient';

/**
 * Get daily YouTube video recommendations
 * Public endpoint - no authentication required
 * Uses the /youtube/videos/daily/recommendations endpoint to get today's recommended videos
 */
export const getYouTubeVideos = async (limit: number = 2): Promise<Video[]> => {
  try {
    const response = await apiClient.get<DailyVideosResponse>(
      `/youtube/videos/daily/recommendations?limit=${limit}`
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
 */
export const getTopUnpushedNews = async (limit: number = 5): Promise<NewsItem[]> => {
  try {
    const data = await apiClient.get<DailyNewsResponse>(
      `/news/daily/recommendations?limit=${limit}`
    );
    return data.data.items;
  } catch (error) {
    console.error('Error fetching daily news recommendations:', error);
    throw error;
  }
};
