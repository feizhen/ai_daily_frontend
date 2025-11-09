import { apiClient } from '../utils/apiClient';

export type FavoriteType = 'video' | 'news';

export interface FavoriteItem {
  id: string;
  userId: string;
  favoriteType: FavoriteType;
  favoriteId: string;
  createdAt: string;
}

export interface AddFavoriteRequest {
  favoriteType: FavoriteType;
  favoriteId: string;
}

export interface FavoritesResponse {
  success: boolean;
  data: {
    items: FavoriteItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface FavoriteResponse {
  success: boolean;
  data: FavoriteItem;
}

/**
 * Add a video or news to favorites
 */
export async function addFavorite(data: AddFavoriteRequest): Promise<FavoriteResponse> {
  return apiClient.post<FavoriteResponse>('/favorites', data, { requiresAuth: true });
}

/**
 * Remove a favorite by ID
 */
export async function removeFavorite(favoriteId: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/favorites/${favoriteId}`, { requiresAuth: true });
}

/**
 * Get user's favorites
 */
export async function getUserFavorites(
  type?: FavoriteType,
  page: number = 1,
  limit: number = 100
): Promise<FavoritesResponse> {
  const params = new URLSearchParams();
  if (type) params.append('favoriteType', type);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const url = `/favorites?${params.toString()}`;
  return apiClient.get<FavoritesResponse>(url, { requiresAuth: true });
}

/**
 * Check if an item is favorited
 */
export async function checkFavorite(favoriteType: FavoriteType, favoriteId: string): Promise<{ isFavorited: boolean; favoriteItemId?: string }> {
  return apiClient.get<{ isFavorited: boolean; favoriteItemId?: string }>(
    `/favorites/check?type=${favoriteType}&id=${favoriteId}`,
    { requiresAuth: true }
  );
}
