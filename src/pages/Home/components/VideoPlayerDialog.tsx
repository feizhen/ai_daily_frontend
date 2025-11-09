import React, { useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, Bookmark, X } from 'lucide-react';
import type { Video } from '../../../types/api';
import { formatNumber, formatRelativeTime } from '../../../lib/formatters';
import { useAuth } from '../../../contexts/AuthContext';
import { useFavorites } from '../../../contexts/FavoritesContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../hooks/use-toast';
import styles from './VideoPlayerDialog.module.less';

interface VideoPlayerDialogProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VideoPlayerDialog: React.FC<VideoPlayerDialogProps> = ({ video, open, onOpenChange }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    isFavorited,
    addToFavorites,
    removeFromFavorites,
    optimisticAdd,
    optimisticRemove,
    rollbackAdd,
    rollbackRemove
  } = useFavorites();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tooltipEnabled, setTooltipEnabled] = useState(false);

  // 延迟启用 tooltip，避免打开弹窗时立即触发
  useEffect(() => {
    if (open) {
      setTooltipEnabled(false);
      const timer = setTimeout(() => {
        setTooltipEnabled(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setTooltipEnabled(false);
    }
  }, [open]);

  if (!video) return null;

  // Check if user is a regular user (not admin)
  const isRegularUser = isAuthenticated && user?.role !== 'admin';
  const favorited = isFavorited(video.id);

  // Get AI summary based on language
  const aiSummary = language === 'zh' && video.aiSummaryZh ? video.aiSummaryZh : video.aiSummary;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const wasFavorited = favorited;
    let savedFavoriteId: string | undefined;

    setLoading(true);

    try {
      if (wasFavorited) {
        // 乐观更新：立即移除收藏样式
        savedFavoriteId = optimisticRemove(video.id);

        // 调用 API
        await removeFromFavorites(video.id);

        // 成功后显示提示
        toast({
          title: t('favorites.removedFromFavorites'),
          description: t('favorites.videoRemoved'),
        });
      } else {
        // 乐观更新：立即显示收藏样式
        optimisticAdd(video.id, 'temp');

        // 调用 API
        await addToFavorites('video', video.id);

        // 成功后显示提示
        toast({
          title: t('favorites.addedToFavorites'),
          description: t('favorites.videoAdded'),
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);

      // 失败时回滚
      if (wasFavorited && savedFavoriteId) {
        rollbackRemove(video.id, savedFavoriteId);
      } else {
        rollbackAdd(video.id);
      }

      // 显示错误提示
      toast({
        variant: "destructive",
        title: t('favorites.operationFailed'),
        description: t('favorites.failedToUpdate'),
      });
    } finally {
      setLoading(false);
    }
  };

  // 优化 YouTube 嵌入 URL，使用官方 API 参数移除多余信息
  const getOptimizedEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);

      // YouTube IFrame Player API 官方参数
      // 参考：https://developers.google.com/youtube/player_parameters

      urlObj.searchParams.set('modestbranding', '1'); // 移除 YouTube logo（仅在控制栏）
      urlObj.searchParams.set('rel', '0'); // 播放结束后显示来自同一频道的相关视频
      urlObj.searchParams.set('iv_load_policy', '3'); // 隐藏视频注释
      urlObj.searchParams.set('color', 'white'); // 使用白色进度条
      urlObj.searchParams.set('playsinline', '1'); // 内联播放（移动端）
      urlObj.searchParams.set('controls', '1'); // 显示播放控制
      urlObj.searchParams.set('disablekb', '0'); // 启用键盘控制
      urlObj.searchParams.set('fs', '1'); // 允许全屏
      urlObj.searchParams.set('autohide', '1'); // 播放时自动隐藏控制条

      // 注意：showinfo 参数已被弃用，无法再隐藏标题和上传者信息
      // YouTube 不再提供完全隐藏标题栏的官方方式

      return urlObj.toString();
    } catch {
      return url;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={styles.sheetContent}>
        <div className={styles.container}>
          {/* 顶部标题栏 */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {(video.authorAvatarUrl || video.channel?.thumbnailUrl) && (
                <img
                  src={video.authorAvatarUrl || video.channel?.thumbnailUrl || ''}
                  alt={video.author || video.channel?.channelName || 'Channel'}
                  className={styles.headerAvatar}
                />
              )}
              <div className={styles.headerInfo}>
                <span className={styles.channelName}>
                  {video.author || video.channel?.channelName || 'Unknown Channel'}
                </span>
              </div>
            </div>
            <div className={styles.headerActions}>
              {isRegularUser && (
                <TooltipProvider delayDuration={200} skipDelayDuration={0}>
                  <Tooltip open={tooltipEnabled ? undefined : false}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`${styles.iconButton} ${favorited ? styles.bookmarkedButton : ''}`}
                        onClick={handleFavoriteClick}
                        disabled={loading}
                      >
                        <Bookmark className={favorited ? styles.bookmarked : ''} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{favorited ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={styles.iconButton}
                onClick={() => onOpenChange(false)}
              >
                <X />
              </Button>
            </div>
          </div>

          {/* 可滚动区域 */}
          <div className={styles.scrollableArea}>
            {/* 视频播放器区域 */}
            <div className={styles.playerWrapper}>
              <iframe
                src={getOptimizedEmbedUrl(video.embedUrl)}
                className={styles.player}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
                frameBorder="0"
              />
            </div>

            {/* 内容区域 */}
            <div className={styles.content}>
            {/* 视频标题和标签 */}
            <div className={styles.titleSection}>
              <div className={styles.categoryBadge}>
                <Badge variant="secondary">{video.category}</Badge>
              </div>
              <h2 className={styles.title}>{video.title}</h2>
              <div className={styles.stats}>
                <span className={styles.statItem}>
                  <Eye className={styles.icon} />
                  {formatNumber(video.viewCount)} {t('video.views')}
                </span>
                <span className={styles.dot}>•</span>
                <span>{formatRelativeTime(video.publishedAt)}</span>
              </div>
            </div>


            {/* 频道信息 */}
            {video.channel && (
              <div className={styles.channelCard}>
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
                    <div className={styles.channelNameText}>{video.channel.channelName}</div>
                    <div className={styles.subscriberCount}>
                      {formatNumber(video.channel.subscriberCount || 0)} {t('videoPlayer.subscribers')}
                    </div>
                  </div>
                </div>
                <Button variant="default" size="sm" className={styles.subscribeButton}>
                  {t('videoPlayer.subscribe')}
                </Button>
              </div>
            )}

            {/* AI 摘要（如果有） */}
            {aiSummary && (
              <div className={styles.contentCard}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{t('videoPlayer.aiSummary')}</h3>
                  <Badge variant="secondary" className={styles.aiBadge}>{t('videoPlayer.aiGenerated')}</Badge>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.expandedText}>
                    {aiSummary}
                  </p>
                </div>
              </div>
            )}

            {/* 视频描述 */}
            <div className={styles.contentCard}>
              <h3 className={styles.sectionTitle}>{t('videoPlayer.description')}</h3>
              <div className={styles.sectionContent}>
                <div className={isDescriptionExpanded ? styles.expandedText : styles.clampedText}>
                  {video.description}
                </div>
                {video.description.length > 200 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className={styles.expandButton}
                  >
                    {isDescriptionExpanded ? t('video.showLess') : t('video.showMore')}
                  </Button>
                )}
              </div>
            </div>

            {/* 字幕/文字稿（如果有） */}
            {video.transcript && (
              <div className={styles.contentCard}>
                <h3 className={styles.sectionTitle}>{t('videoPlayer.transcript')}</h3>
                <div className={styles.sectionContent}>
                  <div className={isTranscriptExpanded ? styles.transcriptText : styles.clampedTranscript}>
                    {video.transcript}
                  </div>
                  {video.transcript.length > 300 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                      className={styles.expandButton}
                    >
                      {isTranscriptExpanded ? t('video.showLess') : t('videoPlayer.showFullTranscript')}
                    </Button>
                  )}
                </div>
              </div>
            )}

            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VideoPlayerDialog;
