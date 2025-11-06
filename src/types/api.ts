export interface Channel {
  id: string;
  channelId: string;
  channelName: string;
  channelUrl: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  videoId: string;
  channelId: string;
  channel: Channel;
  title: string;
  description: string;
  thumbnailUrl: string;
  embedUrl: string;
  author: string;
  duration: number;
  durationFormatted: string;
  publishedAt: string;
  viewCount: string;
  likeCount: number;
  commentCount: number;
  category: string;
  tags: string[];
  transcript: string | null;
  aiSummary: string | null;
  relevanceScore: number;
  isPushed: boolean;
  isWatched: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsCategory {
  en: string;
  zh: string;
}

export interface NewsTitle {
  en: string;
  zh: string;
}

export interface NewsSummary {
  en: string;
  zh: string;
}

export interface NewsItem {
  id: string;
  category: NewsCategory;
  title: NewsTitle;
  emoji: string;
  url: string;
  imageUrl: string;
  summary: NewsSummary;
  details: {
    en: string[];
    zh: string[];
  };
  significance: {
    en: string;
    zh: string;
  };
  sourceEmailId: string;
  sourceEmailDate: string;
  isPushed: boolean;
  isRead: boolean;
  isLiked: boolean;
  pushedAt: string | null;
  readAt: string | null;
  likedAt: string | null;
  createdAt: string;
  updatedAt: string;
}