/**
 * JWT Token 解析和过期时间检查工具
 */

interface JWTPayload {
  exp?: number; // 过期时间戳（秒）
  iat?: number; // 签发时间戳（秒）
  [key: string]: any;
}

/**
 * 安全解析 JWT Token
 * @param token JWT token 字符串
 * @returns 解析后的 payload，失败返回 null
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    // JWT 格式: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // 解码 payload (base64url)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

/**
 * 获取 Token 过期时间（毫秒时间戳）
 * @param token JWT token 字符串
 * @returns 过期时间戳（毫秒），失败返回 null
 */
export function getTokenExpiration(token: string): number | null {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  // JWT exp 是秒级时间戳，转换为毫秒
  return payload.exp * 1000;
}

/**
 * 检查 Token 是否已过期
 * @param token JWT token 字符串
 * @returns true 表示已过期，false 表示未过期
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true; // 无法解析视为已过期
  }

  return Date.now() >= expiration;
}

/**
 * 获取 Token 剩余有效时间（毫秒）
 * @param token JWT token 字符串
 * @returns 剩余时间（毫秒），已过期或解析失败返回 0
 */
export function getTokenRemainingTime(token: string): number {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return 0;
  }

  const remaining = expiration - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * 检查 Token 是否即将过期（默认 5 分钟内）
 * @param token JWT token 字符串
 * @param thresholdMs 阈值（毫秒），默认 5 分钟
 * @returns true 表示即将过期
 */
export function isTokenExpiringSoon(token: string, thresholdMs: number = 5 * 60 * 1000): boolean {
  const remaining = getTokenRemainingTime(token);
  return remaining > 0 && remaining <= thresholdMs;
}

/**
 * 格式化剩余时间为可读字符串
 * @param ms 毫秒数
 * @returns 格式化的时间字符串
 */
export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '已过期';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} 天`;
  if (hours > 0) return `${hours} 小时`;
  if (minutes > 0) return `${minutes} 分钟`;
  return `${seconds} 秒`;
}
