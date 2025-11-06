import axios from 'axios';
import type { Video, NewsItem } from '../types/api';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getYouTubeVideos = async (): Promise<Video[]> => {
  try {
    const response = await apiClient.get<Video[]>('/youtube/videos');
    return response.data;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
};

export const getTopUnpushedNews = async (limit: number = 5): Promise<NewsItem[]> => {
  try {
    const response = await apiClient.get(`/news/top-unpushed?limit=${limit}`);
    return response.data.data.items;
  } catch (error) {
    console.error('Error fetching top unpushed news:', error);
    throw error;
  }
};