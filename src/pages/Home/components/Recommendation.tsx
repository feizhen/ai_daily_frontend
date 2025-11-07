import React, { useEffect, useState, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { Button } from '@/components/ui/button';
import styles from './Recommendation.module.less';
import VideoCard from './VideoCard.tsx';
import VideoPlayerDialog from './VideoPlayerDialog';
import { getYouTubeVideos, getTopUnpushedNews } from '../../../api/home';
import type { Video, NewsItem } from '../../../types/api';

const Recommendation: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasFetched = useRef(false);

  const breakpointColumnsObj = {
    default: 3,  // >= 1200px
    1199: 3,     // >= 992px and < 1200px
    991: 2,      // >= 768px and < 992px
    767: 1       // < 768px
  };

  useEffect(() => {
    // 防止 StrictMode 导致的重复请求
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        // 并行请求 videos 和 news
        const [videoData, newsData] = await Promise.all([
          getYouTubeVideos(),
          getTopUnpushedNews()
        ]);
        setVideos(videoData);
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const items = [...videos, ...news];

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  return (
    <div className={styles.recommendation}>
      <div className={styles.header}>
        <h2>Today's recommend</h2>
        <p>showing {items.length} summarys</p>
        <Button variant="refresh" className={styles.refreshButton}>↻</Button>
      </div>
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading recommendations...</p>
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