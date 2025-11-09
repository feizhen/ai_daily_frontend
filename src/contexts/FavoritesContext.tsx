import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUserFavorites, addFavorite, removeFavorite, type FavoriteType, type FavoriteItem } from '../api/favorites';

interface FavoritesContextType {
  favorites: Map<string, string>; // key: itemId, value: favoriteItemId
  isLoading: boolean;
  addToFavorites: (itemType: FavoriteType, itemId: string) => Promise<void>;
  removeFromFavorites: (itemId: string) => Promise<void>;
  isFavorited: (itemId: string) => boolean;
  getFavoriteItemId: (itemId: string) => string | undefined;
  refreshFavorites: () => Promise<void>;
  optimisticAdd: (itemId: string, tempId: string) => void;
  optimisticRemove: (itemId: string) => string | undefined;
  rollbackAdd: (itemId: string) => void;
  rollbackRemove: (itemId: string, favoriteId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const isRegularUser = isAuthenticated && user?.role !== 'admin';

  const refreshFavorites = async () => {
    if (!isRegularUser) {
      setFavorites(new Map());
      return;
    }

    try {
      setIsLoading(true);
      const response = await getUserFavorites();
      const favMap = new Map<string, string>();

      console.log('Favorites API response:', response);

      // API 返回的数据可能在 response.data.items 或 response.data 中
      const items = response.data?.items || (Array.isArray(response.data) ? response.data : []);

      if (!Array.isArray(items)) {
        console.warn('Favorites response is not an array:', response.data);
        setFavorites(new Map());
        return;
      }

      // content.id 是视频/新闻的实际id，fav.id 是收藏记录的id
      items.forEach((fav: FavoriteItem) => {
        const itemId = fav.content?.id || fav.favoriteId;
        favMap.set(itemId, fav.id);
        console.log(`Loaded favorite: ${fav.favoriteType} - ${itemId}`);
      });

      console.log(`✓ Loaded ${favMap.size} favorites`);
      setFavorites(favMap);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites(new Map());
    } finally {
      setIsLoading(false);
    }
  };

  // Load favorites on mount or when user changes
  useEffect(() => {
    refreshFavorites();
  }, [isRegularUser]);

  const addToFavorites = async (itemType: FavoriteType, itemId: string) => {
    try {
      const result = await addFavorite({
        favoriteType: itemType,
        favoriteId: itemId,
      });

      console.log('Add favorite response:', result);

      // 根据 API 响应格式获取收藏记录的 ID
      const favoriteRecordId = result.data?.id || result.id;

      if (!favoriteRecordId) {
        console.error('No favorite ID in response:', result);
        throw new Error('Invalid response: missing favorite ID');
      }

      setFavorites(prev => {
        const newMap = new Map(prev);
        newMap.set(itemId, favoriteRecordId);
        console.log(`✓ Added to favorites: ${itemType} - ${itemId} (record: ${favoriteRecordId})`);
        return newMap;
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (itemId: string) => {
    const favoriteItemId = favorites.get(itemId);

    if (!favoriteItemId) {
      console.warn(`Item ${itemId} not found in favorites, skipping removal`);
      return;
    }

    try {
      console.log(`Removing favorite: ${itemId} (record: ${favoriteItemId})`);
      const result = await removeFavorite(favoriteItemId);
      console.log('Remove favorite response:', result);

      setFavorites(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        console.log(`✓ Removed from favorites: ${itemId}`);
        return newMap;
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  const isFavorited = (itemId: string): boolean => {
    return favorites.has(itemId);
  };

  const getFavoriteItemId = (itemId: string): string | undefined => {
    return favorites.get(itemId);
  };

  // 乐观更新：立即添加到收藏
  const optimisticAdd = (itemId: string, tempId: string = 'temp') => {
    setFavorites(prev => {
      const newMap = new Map(prev);
      newMap.set(itemId, tempId);
      return newMap;
    });
  };

  // 乐观更新：立即从收藏移除
  const optimisticRemove = (itemId: string): string | undefined => {
    const favoriteId = favorites.get(itemId);
    setFavorites(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
    return favoriteId;
  };

  // 回滚添加操作
  const rollbackAdd = (itemId: string) => {
    setFavorites(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
  };

  // 回滚删除操作
  const rollbackRemove = (itemId: string, favoriteId: string) => {
    setFavorites(prev => {
      const newMap = new Map(prev);
      newMap.set(itemId, favoriteId);
      return newMap;
    });
  };

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    getFavoriteItemId,
    refreshFavorites,
    optimisticAdd,
    optimisticRemove,
    rollbackAdd,
    rollbackRemove,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
