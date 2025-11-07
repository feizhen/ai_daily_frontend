import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import type { Video } from '../../../types/api';
import { formatNumber, formatRelativeTime } from '../../../lib/formatters';
import styles from './VideoPlayerDialog.module.less';

interface VideoPlayerDialogProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VideoPlayerDialog: React.FC<VideoPlayerDialogProps> = ({ video, open, onOpenChange }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

  if (!video) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={styles.sheetContent}>
        <div className={styles.container}>
          {/* 视频播放器区域 */}
          <div className={styles.playerWrapper}>
            <iframe
              src={video.embedUrl}
              className={styles.player}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          </div>

          {/* 滚动内容区域 */}
          <div className={styles.content}>
            {/* 视频标题和统计 */}
            <div className={styles.titleSection}>
              <h2 className={styles.title}>{video.title}</h2>
              <div className={styles.stats}>
                <span className={styles.statItem}>
                  <Eye className={styles.icon} />
                  {formatNumber(video.viewCount)} 观看
                </span>
                <span className={styles.dot}>•</span>
                <span>{formatRelativeTime(video.publishedAt)}</span>
              </div>
            </div>

            {/* 频道信息 */}
            {video.channel && (
              <div className={styles.channelSection}>
                <div className={styles.channelInfo}>
                  <div className={styles.channelAvatar}>
                    {video.channel.thumbnailUrl ? (
                      <img src={video.channel.thumbnailUrl} alt={video.channel.channelName} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {video.channel.channelName?.charAt(0).toUpperCase() || 'C'}
                      </div>
                    )}
                  </div>
                  <div className={styles.channelDetails}>
                    <div className={styles.channelName}>{video.channel.channelName}</div>
                    <div className={styles.subscriberCount}>
                      {formatNumber(video.channel.subscriberCount || 0)} 订阅者
                    </div>
                  </div>
                </div>
                <Button variant="default" size="sm">
                  订阅
                </Button>
              </div>
            )}

            {/* AI 摘要（如果有） */}
            {video.aiSummary && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>AI 摘要</h3>
                  <Badge variant="secondary">AI 生成</Badge>
                </div>
                <div className={styles.sectionContent}>
                  <p className={isSummaryExpanded ? '' : styles.clampedText}>
                    {video.aiSummary}
                  </p>
                  {video.aiSummary.length > 200 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className={styles.expandButton}
                    >
                      {isSummaryExpanded ? '收起' : '展开'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* 视频描述 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>描述</h3>
              <div className={styles.sectionContent}>
                <p className={isDescriptionExpanded ? '' : styles.clampedText}>
                  {video.description}
                </p>
                {video.description.length > 200 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className={styles.expandButton}
                  >
                    {isDescriptionExpanded ? '收起' : '展开'}
                  </Button>
                )}
              </div>
            </div>

            {/* 分类和标签 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>分类与标签</h3>
              <div className={styles.tagsContainer}>
                <Badge variant="default">{video.category}</Badge>
                {video.tags.slice(0, 5).map((tag, index) => (
                  <Badge key={index} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 字幕/文字稿（如果有） */}
            {video.transcript && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>字幕文字稿</h3>
                <div className={styles.sectionContent}>
                  <p className={isTranscriptExpanded ? styles.transcriptText : styles.clampedTranscript}>
                    {video.transcript}
                  </p>
                  {video.transcript.length > 300 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                      className={styles.expandButton}
                    >
                      {isTranscriptExpanded ? '收起' : '展开完整字幕'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* 额外信息 */}
            <div className={styles.section}>
              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>时长:</span>
                  <span className={styles.metaValue}>{video.durationFormatted}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>发布时间:</span>
                  <span className={styles.metaValue}>{formatRelativeTime(video.publishedAt)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>相关性评分:</span>
                  <span className={styles.metaValue}>{video.relevanceScore}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VideoPlayerDialog;
