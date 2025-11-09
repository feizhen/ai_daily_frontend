/**
 * Token 刷新管理器
 * 负责主动检查和刷新 access token，避免 token 过期导致请求失败
 */

import { isTokenExpiringSoon, getTokenRemainingTime } from './jwtHelper';

const ACCESS_TOKEN_KEY = 'ai_daily_access_token';
const REFRESH_TOKEN_KEY = 'ai_daily_refresh_token';

// 刷新阈值：提前 5 分钟刷新
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// 检查间隔：每分钟检查一次
const CHECK_INTERVAL_MS = 60 * 1000;

type RefreshCallback = () => Promise<boolean>;

class TokenRefreshManager {
  private checkInterval: number | null = null;
  private refreshCallback: RefreshCallback | null = null;
  private isRefreshing: boolean = false;

  /**
   * 启动自动刷新管理器
   * @param refreshCallback 刷新 token 的回调函数，返回 Promise<boolean> 表示是否成功
   */
  start(refreshCallback: RefreshCallback): void {
    this.refreshCallback = refreshCallback;

    // 清除旧的定时器
    this.stop();

    // 立即检查一次
    this.checkAndRefresh();

    // 定时检查
    this.checkInterval = window.setInterval(() => {
      this.checkAndRefresh();
    }, CHECK_INTERVAL_MS);

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    console.log('[TokenRefreshManager] Started');
  }

  /**
   * 停止自动刷新管理器
   */
  stop(): void {
    if (this.checkInterval !== null) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this.refreshCallback = null;
    this.isRefreshing = false;

    console.log('[TokenRefreshManager] Stopped');
  }

  /**
   * 检查并刷新 token
   */
  private checkAndRefresh = async (): Promise<void> => {
    // 防止重复刷新
    if (this.isRefreshing) {
      console.log('[TokenRefreshManager] Already refreshing, skipping');
      return;
    }

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      console.log('[TokenRefreshManager] No tokens found, skipping check');
      return;
    }

    // 检查 access token 是否即将过期
    if (isTokenExpiringSoon(accessToken, REFRESH_THRESHOLD_MS)) {
      const remaining = getTokenRemainingTime(accessToken);
      console.log(`[TokenRefreshManager] Token expiring soon (${Math.floor(remaining / 1000)}s remaining), refreshing...`);

      await this.performRefresh();
    } else {
      const remaining = getTokenRemainingTime(accessToken);
      console.log(`[TokenRefreshManager] Token still valid (${Math.floor(remaining / 1000)}s remaining)`);
    }
  };

  /**
   * 执行刷新操作
   */
  private performRefresh = async (): Promise<void> => {
    if (!this.refreshCallback) {
      console.error('[TokenRefreshManager] No refresh callback set');
      return;
    }

    this.isRefreshing = true;

    try {
      const success = await this.refreshCallback();

      if (success) {
        console.log('[TokenRefreshManager] Token refreshed successfully');
      } else {
        console.error('[TokenRefreshManager] Token refresh failed');
      }
    } catch (error) {
      console.error('[TokenRefreshManager] Error during token refresh:', error);
    } finally {
      this.isRefreshing = false;
    }
  };

  /**
   * 处理页面可见性变化
   * 当页面从隐藏变为可见时，立即检查 token
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      console.log('[TokenRefreshManager] Page became visible, checking token');
      this.checkAndRefresh();
    }
  };
}

// 导出单例实例
export const tokenRefreshManager = new TokenRefreshManager();
