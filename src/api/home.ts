import type { Video, NewsItem } from '../types/api';

const API_BASE_URL = '/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Fetch 包装函数，添加超时和错误处理
export async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export const getYouTubeVideos = async (): Promise<Video[]> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/youtube/videos`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
};

export const getTopUnpushedNews = async (limit: number = 5): Promise<NewsItem[]> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/news/top-unpushed?limit=${limit}`);
    const data = await response.json();
    return data.data.items;
  } catch (error) {
    console.error('Error fetching top unpushed news:', error);
    throw error;
  }
};
