import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'ai_daily_language';

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.greeting': 'Hello',
    'header.welcome': "Welcome to today's AI Daily",

    // User Menu
    'userMenu.signIn': 'Sign In',
    'userMenu.signUp': 'Sign Up',
    'userMenu.signOut': 'Sign Out',
    'userMenu.signingIn': 'Signing in...',
    'userMenu.signingUp': 'Signing up...',
    'userMenu.signingOut': 'Signing out...',
    'userMenu.email': 'Email',
    'userMenu.password': 'Password',
    'userMenu.nickname': 'Nickname (Optional)',
    'userMenu.emailPlaceholder': 'your@email.com',
    'userMenu.passwordPlaceholder': '••••••••',
    'userMenu.nicknamePlaceholder': 'Your nickname',
    'userMenu.passwordHint': 'At least 8 characters with uppercase, lowercase and numbers',
    'userMenu.signInPrompt': 'Sign in to access admin features',
    'userMenu.signUpPrompt': 'Create an account to access admin features',
    'userMenu.alreadyHaveAccount': 'Already have an account? Sign In',
    'userMenu.noAccount': "Don't have an account? Sign Up",
    'userMenu.videoManagement': 'Video Management',
    'userMenu.newsManagement': 'News Management',
    'userMenu.language': 'Language',
    'userMenu.admin': 'Admin',

    // Language names
    'language.en': 'English',
    'language.zh': '中文',

    // Video Card
    'video.showMore': 'Show more',
    'video.showLess': 'Show less',
    'video.views': 'views',

    // News Card
    'news.summary': 'Summary:',
    'news.details': 'The details:',
    'news.significance': 'Why it matters:',

    // Favorites
    'favorites.addedToFavorites': 'Added to favorites',
    'favorites.removedFromFavorites': 'Removed from favorites',
    'favorites.videoAdded': 'Video saved to your favorites',
    'favorites.videoRemoved': 'Video removed from your favorites',
    'favorites.newsAdded': 'News saved to your favorites',
    'favorites.newsRemoved': 'News removed from your favorites',
    'favorites.operationFailed': 'Operation failed',
    'favorites.failedToUpdate': 'Failed to update favorites. Please try again later.',
    'favorites.addToFavorites': 'Favorite',
    'favorites.removeFromFavorites': 'Unfavorite',

    // Video Player Dialog
    'videoPlayer.description': 'Description',
    'videoPlayer.transcript': 'Transcript',
    'videoPlayer.aiSummary': 'AI Summary',
    'videoPlayer.aiGenerated': 'AI Generated',
    'videoPlayer.subscribers': 'subscribers',
    'videoPlayer.subscribe': 'Subscribe',
    'videoPlayer.showFullTranscript': 'Show full transcript',

    // Filters
    'filter.all': 'All',
    'filter.video': 'video',
    'filter.news': 'news',

    // Recommendation
    'recommendation.todayRecommend': "Today's recommend",
    'recommendation.myFavorites': 'My Favorites',
    'recommendation.showing': 'showing',
    'recommendation.items': 'items',
    'recommendation.loadingFavorites': 'Loading favorites...',
    'recommendation.loadingRecommendations': 'Loading recommendations...',
    'recommendation.noFavorites': 'No favorites yet',
    'recommendation.noItems': 'No items found',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  zh: {
    // Header
    'header.greeting': '你好',
    'header.welcome': '欢迎来到今日 AI Daily',

    // User Menu
    'userMenu.signIn': '登录',
    'userMenu.signUp': '注册',
    'userMenu.signOut': '退出登录',
    'userMenu.signingIn': '登录中...',
    'userMenu.signingUp': '注册中...',
    'userMenu.signingOut': '退出中...',
    'userMenu.email': '邮箱',
    'userMenu.password': '密码',
    'userMenu.nickname': '昵称（可选）',
    'userMenu.emailPlaceholder': '你的邮箱',
    'userMenu.passwordPlaceholder': '••••••••',
    'userMenu.nicknamePlaceholder': '你的昵称',
    'userMenu.passwordHint': '至少 8 个字符，包含大小写字母和数字',
    'userMenu.signInPrompt': '登录以访问管理功能',
    'userMenu.signUpPrompt': '创建账户以访问管理功能',
    'userMenu.alreadyHaveAccount': '已有账户？立即登录',
    'userMenu.noAccount': '还没有账户？立即注册',
    'userMenu.videoManagement': '视频管理',
    'userMenu.newsManagement': '新闻管理',
    'userMenu.language': '语言',
    'userMenu.admin': '管理员',

    // Language names
    'language.en': 'English',
    'language.zh': '中文',

    // Video Card
    'video.showMore': '展开更多',
    'video.showLess': '收起',
    'video.views': '次观看',

    // News Card
    'news.summary': '摘要：',
    'news.details': '详细内容：',
    'news.significance': '为什么重要：',

    // Favorites
    'favorites.addedToFavorites': '已添加到收藏',
    'favorites.removedFromFavorites': '已从收藏中移除',
    'favorites.videoAdded': '视频已保存到您的收藏',
    'favorites.videoRemoved': '视频已从您的收藏中移除',
    'favorites.newsAdded': '新闻已保存到您的收藏',
    'favorites.newsRemoved': '新闻已从您的收藏中移除',
    'favorites.operationFailed': '操作失败',
    'favorites.failedToUpdate': '更新收藏失败，请稍后重试',
    'favorites.addToFavorites': '收藏',
    'favorites.removeFromFavorites': '取消收藏',

    // Video Player Dialog
    'videoPlayer.description': '视频描述',
    'videoPlayer.transcript': '字幕文稿',
    'videoPlayer.aiSummary': 'AI 摘要',
    'videoPlayer.aiGenerated': 'AI 生成',
    'videoPlayer.subscribers': '位订阅者',
    'videoPlayer.subscribe': '订阅',
    'videoPlayer.showFullTranscript': '查看完整文稿',

    // Filters
    'filter.all': '全部',
    'filter.video': '视频',
    'filter.news': '新闻',

    // Recommendation
    'recommendation.todayRecommend': '今日推荐',
    'recommendation.myFavorites': '我的收藏',
    'recommendation.showing': '显示',
    'recommendation.items': '项',
    'recommendation.loadingFavorites': '加载收藏中...',
    'recommendation.loadingRecommendations': '加载推荐中...',
    'recommendation.noFavorites': '暂无收藏',
    'recommendation.noItems': '暂无内容',

    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize from localStorage or default to English
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    return (savedLanguage === 'zh' || savedLanguage === 'en') ? savedLanguage : 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage whenever it changes
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
