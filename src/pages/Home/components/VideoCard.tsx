import React from 'react';
import styles from './VideoCard.module.less';
import type { Video, NewsItem } from '../../../types/api';

interface VideoCardProps {
  item: Video | NewsItem;
}

const VideoCard: React.FC<VideoCardProps> = ({ item }) => {
  const isVideo = (item: Video | NewsItem): item is Video => 'videoId' in item;

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
        <div className={styles.content}>
          <h3>{isVideo(item) ? item.title : item.title.en}</h3>
          <div className={styles.descriptionWrapper}>
            <p className={styles.clamp}>{description}</p>
          </div>
        </div>
        <div className={styles.meta}>
          <div className={styles.authorInfo}>
            <div className={styles.avatar}>
              <span>{(isVideo(item) ? item.author : item.sourceEmailId).charAt(0).toUpperCase()}</span>
            </div>
            <div className={styles.authorDetails}>
              <span className={styles.authorName}>{isVideo(item) ? item.author : item.sourceEmailId}</span>
              <span className={styles.time}>{new Date(isVideo(item) ? item.publishedAt : item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.favoriteButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 3C14.76 3 13.09 3.81 12 5.09C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.42 2 8.5C2 12.28 5.4 15.36 10.55 20.04L12 21.35L13.45 20.03C18.6 15.36 22 12.28 22 8.5C22 5.42 19.58 3 16.5 3Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;