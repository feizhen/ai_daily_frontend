import React, { useEffect, useState, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import styles from './Recommendation.module.less';
import VideoCard from './VideoCard.tsx';
import VideoPlayerDialog from './VideoPlayerDialog';
import { getYouTubeVideos, getTopUnpushedNews } from '../../../api/home';
import { getUserFavorites } from '../../../api/favorites';
import { useFavorites } from '../../../contexts/FavoritesContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Video, NewsItem } from '../../../types/api';
import type { FilterType } from '../index';

interface RecommendationProps {
  activeFilter: FilterType;
  isFavoritesMode: boolean;
  selectedDate: Date;
}

const Recommendation: React.FC<RecommendationProps> = ({ activeFilter, isFavoritesMode, selectedDate }) => {
  const { t } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [favorites, setFavorites] = useState<(Video | NewsItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasFetched = useRef(false);
  const { favorites: favoritesMap } = useFavorites();

  const breakpointColumnsObj = {
    default: 3,  // >= 1200px
    1199: 3,     // >= 992px and < 1200px
    991: 2,      // >= 768px and < 992px
    767: 1       // < 768px
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 将日期格式化为 YYYY-MM-DD
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        console.log('Fetching data for date:', dateStr);

        // 并行请求 videos 和 news
        const [videoData, newsData] = await Promise.all([
          getYouTubeVideos(2, dateStr),
          getTopUnpushedNews(5, dateStr)
        ]);
        console.log('Video data:', videoData);
        console.log('News data:', newsData);
        setVideos(videoData || []);
        setNews(newsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // 确保即使出错也设置为空数组
        setVideos([]);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]); // 当日期变化时重新获取数据

  // 当进入收藏模式时获取收藏内容
  useEffect(() => {
    if (isFavoritesMode) {
      const fetchFavorites = async () => {
        try {
          setLoading(true);
          const response = await getUserFavorites();
          console.log('Favorites API response:', response);
          console.log('Favorites items:', response.data?.items);

          // 从收藏记录中提取实际内容
          // API 返回的数据结构：response = { data: Array, total: 2, page: 1, ... }
          const itemsList = Array.isArray((response as any).data)
            ? (response as any).data
            : [];
          console.log('Items list:', itemsList);

          const favoriteItems = itemsList
            .map((item: any) => {
              console.log('Processing favorite item:', item);
              const content = item.content;
              if (!content) return null;

              // 如果是 news 类型，需要转换数据格式（从平铺结构转为嵌套结构）
              if (item.favoriteType === 'news') {
                return {
                  id: content.id,
                  emoji: content.emoji,
                  url: content.url,
                  imageUrl: content.image_url,
                  sourceEmailDate: content.source_email_date,
                  category: { en: content.category_en, zh: content.category_zh },
                  title: { en: content.title_en, zh: content.title_zh },
                  summary: { en: content.summary_en, zh: content.summary_zh },
                  details: { en: content.details_en, zh: content.details_zh },
                  significance: { en: content.significance_en, zh: content.significance_zh },
                } as NewsItem;
              }

              return content;
            })
            .filter((content): content is Video | NewsItem => {
              const isValid = content != null;
              console.log('Content valid?', isValid, content);
              return isValid;
            });

          console.log('Final favorite items to display:', favoriteItems);
          setFavorites(favoriteItems);
        } catch (error) {
          console.error('Error fetching favorites:', error);
          setFavorites([]);
        } finally {
          setLoading(false);
        }
      };
      fetchFavorites();
    }
  }, [isFavoritesMode]); // 只在进入收藏模式时获取

  // 监听收藏列表变化，通过筛选 ID 来移除取消收藏的项目
  useEffect(() => {
    if (isFavoritesMode && favorites.length > 0) {
      // 筛选出仍在收藏列表中的项目
      const filteredFavorites = favorites.filter(item => favoritesMap.has(item.id));

      // 只在有项目被移除时更新状态
      if (filteredFavorites.length !== favorites.length) {
        console.log('Filtering out removed favorites:', favorites.length - filteredFavorites.length);
        setFavorites(filteredFavorites);
      }
    }
  }, [favoritesMap, isFavoritesMode]); // 监听收藏列表变化

  // Combine all items
  const allItems = [...(videos || []), ...(news || [])];

  // Filter items based on activeFilter and isFavoritesMode
  const items = isFavoritesMode
    ? favorites.filter((item) => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'video') return 'videoId' in item;
        if (activeFilter === 'news') return !('videoId' in item);
        return true;
      })
    : allItems.filter((item) => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'video') return 'videoId' in item;
        if (activeFilter === 'news') return !('videoId' in item);
        return true;
      });

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  return (
    <div className={styles.recommendation}>
      <div className={styles.header}>
        <h2>{isFavoritesMode ? t('recommendation.myFavorites') : t('recommendation.todayRecommend')}</h2>
        <p>{t('recommendation.showing')} {items.length} {t('recommendation.items')}</p>
        {/* 刷新按钮暂时屏蔽 */}
        {/* <Button variant="refresh" className={styles.refreshButton}>↻</Button> */}
      </div>
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{isFavoritesMode ? t('recommendation.loadingFavorites') : t('recommendation.loadingRecommendations')}</p>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.loadingContainer}>
          <p>{isFavoritesMode ? t('recommendation.noFavorites') : t('recommendation.noItems')}</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className={styles.grid}
          columnClassName={styles.gridColumn}
        >
          {items.map((item) => (
            <VideoCard key={item.id} item={item} onVideoClick={handleVideoClick} />
          ))}
        </Masonry>
      )}

      {/* 视频播放弹窗 */}
      <VideoPlayerDialog
        video={selectedVideo}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default Recommendation;