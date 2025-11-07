import type { Video, NewsItem } from '../types/api';
import { apiClient } from '../utils/apiClient';

/**
 * Get YouTube videos
 * Public endpoint - no authentication required
 */
export const getYouTubeVideos = async (): Promise<Video[]> => {
  try {
    const data = await apiClient.get<Video[]>('/youtube/videos');
    return data;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
};

/**
 * Get top unpushed news
 * Public endpoint - no authentication required
 */
export const getTopUnpushedNews = async (limit: number = 5): Promise<NewsItem[]> => {
  try {
    const data = await apiClient.get<{ success: boolean; data: { items: NewsItem[] } }>(
      `/news/top-unpushed?limit=${limit}`
    );
    return data.data.items;
  } catch (error) {
    console.error('Error fetching top unpushed news:', error);
    throw error;
  }
};
