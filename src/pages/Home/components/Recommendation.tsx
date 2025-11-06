import React, { useEffect, useState } from 'react';
import styles from './Recommendation.module.less';
import VideoCard from './VideoCard.tsx';
import { getYouTubeVideos, getTopUnpushedNews } from '../../../api/home';
import type { Video, NewsItem } from '../../../types/api';

const Recommendation: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videoData = await getYouTubeVideos();
        const newsData = await getTopUnpushedNews();
        setVideos(videoData);
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const items = [...videos, ...news];

  return (
    <div className={styles.recommendation}>
      <div className={styles.header}>
        <h2>Today's recommend</h2>
        <p>showing {items.length} summarys</p>
        <button className={styles.refreshButton}>↻</button>
      </div>
      <div className={styles.grid}>
        {items.map((item) => (
          <VideoCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Recommendation;