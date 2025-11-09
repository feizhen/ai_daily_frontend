import React, { useState } from 'react';
import { Button } from './ui/button';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
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
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites();

  // Check if user is a regular user (not admin)
  const isRegularUser = isAuthenticated && user?.role !== 'admin';

  const favorited = isFavorited(itemId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      if (favorited) {
        // Remove from favorites
        await removeFromFavorites(itemId);
      } else {
        // Add to favorites
        await addToFavorites(itemType, itemId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Bookmark className={favorited ? styles.bookmarked : ''} />
    </Button>
  );
};

export default FavoriteButton;
