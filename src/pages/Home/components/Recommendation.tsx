import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import styles from './Recommendation.module.less';
import VideoCard from './VideoCard.tsx';
import { getYouTubeVideos, getTopUnpushedNews } from '../../../api/home';
import type { Video, NewsItem } from '../../../types/api';

const Recommendation: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  const breakpointColumnsObj = {
    default: 4,  // >= 1200px
    1199: 3,     // >= 992px and < 1200px
    991: 2,      // >= 768px and < 992px
    767: 1       // < 768px
  };

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
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className={styles.grid}
        columnClassName={styles.gridColumn}
      >
        {items.map((item) => (
          <VideoCard key={item.id} item={item} />
        ))}
      </Masonry>
    </div>
  );
};

export default Recommendation;