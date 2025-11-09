import React, { useState } from 'react';
import styles from './VideoCard.module.less';
import type { Video, NewsItem } from '../../../types/api';
import { formatRelativeTime } from '../../../lib/formatters';
import FavoriteButton from '../../../components/FavoriteButton';

interface VideoCardProps {
  item: Video | NewsItem;
  onVideoClick?: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ item, onVideoClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const isVideo = (item: Video | NewsItem): item is Video => 'videoId' in item;

  const handleCardClick = () => {
    if (isVideo(item) && onVideoClick) {
      onVideoClick(item);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // 视频卡片渲染
  if (isVideo(item)) {
    return (
      <div
        className={styles.card}
        onClick={handleCardClick}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
        style={{ cursor: 'pointer' }}
      >
        {item.thumbnailUrl && (
          <div className={styles.thumbnail}>
            <img src={item.thumbnailUrl} alt="thumbnail" />
            <div className={`${styles.playButton} ${isCardHovered ? styles.hovered : ''}`}>▶</div>
          </div>
        )}
        <div className={styles.info}>
          <span className={styles.tag}>{item.category}</span>
          <div className={styles.content}>
            <h3>{item.title}</h3>
            <div className={styles.descriptionWrapper}>
              <p className={styles.clamp}>{item.aiSummary || item.description}</p>
            </div>
          </div>
          <div className={styles.meta}>
            <div className={styles.authorInfo}>
              <div className={styles.avatar}>
                {item.authorAvatarUrl ? (
                  <img src={item.authorAvatarUrl} alt={item.author} />
                ) : (
                  <span>{item.author.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className={styles.authorDetails}>
                <span className={styles.authorName}>{item.author}</span>
                <span className={styles.time}>{formatRelativeTime(item.publishedAt)}</span>
              </div>
            </div>
            <FavoriteButton itemId={item.id} itemType="video" />
          </div>
        </div>
      </div>
    );
  }

  // 新闻卡片渲染
  return (
    <div className={`${styles.newsCard} ${isExpanded ? styles.expanded : ''}`}>
      {/* 图片在最上面，与视频卡片一致 */}
      {item.imageUrl && (
        <div className={styles.newsImage}>
          <img src={item.imageUrl} alt={item.title.en} />
        </div>
      )}

      {/* 内容区域 */}
      <div className={styles.newsInfo}>
        {/* Tag */}
        <span className={styles.newsCategory}>{item.category.en}</span>

        {/* Title */}
        <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.newsTitle}>
          {item.emoji} {item.title.en}
        </a>

        <div className={styles.newsContent}>
          <div className={styles.newsSection}>
            <h4 className={styles.newsSectionTitle}>Summary:</h4>
            <p className={styles.newsSummary}>{item.summary.en}</p>
          </div>
        </div>

        {/* 可折叠内容 */}
        <div className={styles.collapsibleContent}>
          {item.details.en.length > 0 && (
            <div className={styles.newsSection}>
              <h4 className={styles.newsSectionTitle}>The details:</h4>
              <ul className={styles.newsDetailsList}>
                {item.details.en.map((detail, index) => (
                  <li key={index} className={styles.newsDetailsItem}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          {item.significance.en && (
            <div className={styles.newsSection}>
              <h4 className={styles.newsSectionTitle}>Why it matters:</h4>
              <p className={styles.newsSignificance}>{item.significance.en}</p>
            </div>
          )}
        </div>

        {/* Show more 按钮和收藏按钮 */}
        <div className={styles.newsFooter}>
          <button className={styles.showMoreButton} onClick={toggleExpand}>
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
          <FavoriteButton itemId={item.id} itemType="news" />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;