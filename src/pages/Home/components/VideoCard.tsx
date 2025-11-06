import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import styles from './VideoCard.module.less';
import type { Video, NewsItem } from '../../../types/api';

interface VideoCardProps {
  item: Video | NewsItem;
}

const VideoCard: React.FC<VideoCardProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isVideo = (item: Video | NewsItem): item is Video => 'videoId' in item;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const description = isVideo(item) ? item.description : item.summary.en;
  const imageUrl = isVideo(item) ? item.thumbnailUrl : item.imageUrl;

  return (
    <div className={styles.card}>
      {imageUrl && (
        <div className={styles.thumbnail}>
          <img src={imageUrl} alt="thumbnail" />
          {isVideo(item) && <div className={styles.playButton}>▶</div>}
        </div>
      )}
      <div className={styles.info}>
        <span className={styles.tag}>{isVideo(item) ? item.category : item.category.en}</span>
        <h3>{isVideo(item) ? item.title : item.title.en}</h3>
        <div className={styles.descriptionWrapper}>
          <p className={isExpanded ? '' : styles.clamp}>{description}</p>
          {description.length > 100 && ( // Heuristic to decide if button is needed
            <Button onClick={toggleExpand} variant="expand" className={styles.expandButton}>
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </div>
        <div className={styles.meta}>
          <span>{isVideo(item) ? item.author : item.sourceEmailId} - {new Date(isVideo(item) ? item.publishedAt : item.createdAt).toLocaleTimeString()}</span>
          <div className={styles.actions}>
            <span>favorite</span>
            <span>...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;