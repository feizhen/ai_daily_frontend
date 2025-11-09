import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

      // API 返回的数据在 response.data.items 中
      response.data.items.forEach((fav: FavoriteItem) => {
        favMap.set(fav.favoriteId, fav.id);
      });

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

      setFavorites(prev => {
        const newMap = new Map(prev);
        newMap.set(itemId, result.data.id);
        return newMap;
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (itemId: string) => {
    const favoriteItemId = favorites.get(itemId);
    if (!favoriteItemId) return;

    try {
      await removeFavorite(favoriteItemId);

      setFavorites(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
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

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    getFavoriteItemId,
    refreshFavorites,
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
