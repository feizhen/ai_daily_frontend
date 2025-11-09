import React, { useState } from 'react';
import { Button } from './ui/button';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../hooks/use-toast';
import { type FavoriteType } from '../api/favorites';
import styles from './FavoriteButton.module.less';

interface FavoriteButtonProps {
  itemId: string;
  itemType: FavoriteType;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ itemId, itemType, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const {
    isFavorited,
    addToFavorites,
    removeFromFavorites,
    optimisticAdd,
    optimisticRemove,
    rollbackAdd,
    rollbackRemove,
  } = useFavorites();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Check if user is a regular user (not admin)
  const isRegularUser = isAuthenticated && user?.role !== 'admin';

  const favorited = isFavorited(itemId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const wasFavorited = favorited;
    let savedFavoriteId: string | undefined;

    setLoading(true);

    try {
      if (wasFavorited) {
        // 乐观更新：立即移除收藏样式
        savedFavoriteId = optimisticRemove(itemId);

        // 调用 API
        await removeFromFavorites(itemId);

        // 成功后显示提示
        toast({
          title: t('favorites.removedFromFavorites'),
          description: itemType === 'video' ? t('favorites.videoRemoved') : t('favorites.newsRemoved'),
        });
      } else {
        // 乐观更新：立即显示收藏样式
        optimisticAdd(itemId, 'temp');

        // 调用 API
        await addToFavorites(itemType, itemId);

        // 成功后显示提示
        toast({
          title: t('favorites.addedToFavorites'),
          description: itemType === 'video' ? t('favorites.videoAdded') : t('favorites.newsAdded'),
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);

      // 失败时回滚
      if (wasFavorited && savedFavoriteId) {
        rollbackRemove(itemId, savedFavoriteId);
      } else {
        rollbackAdd(itemId);
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

  // Don't render if user is not a regular user
  if (!isRegularUser) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${styles.favoriteButton} ${favorited ? styles.favorited : ''} ${className}`}
      onClick={handleClick}
      disabled={loading}
      title={favorited ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
    >
      <Bookmark className={favorited ? styles.bookmarked : ''} />
    </Button>
  );
};

export default FavoriteButton;
