import React from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFavorites } from '../../../contexts/FavoritesContext';
import styles from './Toolbar.module.less';

interface ToolbarProps {
  isFavoritesMode: boolean;
  onFavoritesToggle: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ isFavoritesMode, onFavoritesToggle }) => {
  const { user, isAuthenticated } = useAuth();
  const { favorites } = useFavorites();

  // 只对普通用户显示收藏按钮
  const isRegularUser = isAuthenticated && user?.role !== 'admin';
  const favoritesCount = favorites.size;

  if (!isRegularUser) {
    return <div className={styles.toolbar} />;
  }

  return (
    <div className={styles.toolbar}>
      <button
        onClick={onFavoritesToggle}
        className={`${styles.favoritesButton} ${isFavoritesMode ? styles.active : ''}`}
      >
        <Bookmark className={styles.icon} />
        <span className={styles.count}>{favoritesCount}</span>
      </button>
    </div>
  );
};

export default Toolbar;