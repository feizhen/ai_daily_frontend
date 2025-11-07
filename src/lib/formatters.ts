/**
 * 格式化数字为可读形式
 * @param num 数字或字符串类型的数字
 * @returns 格式化后的字符串 (例如: 1234567 -> "1.2M")
 */
export function formatNumber(num: number | string): string {
  const number = typeof num === 'string' ? parseInt(num, 10) : num;

  if (isNaN(number)) return '0';

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(1)}B`;
  }
  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}M`;
  }
  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1)}K`;
  }
  return number.toString();
}

/**
 * 格式化相对时间
 * @param dateString ISO 格式的日期字符串
 * @returns 相对时间字符串 (例如: "2天前", "1小时前")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}天前`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}周前`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}个月前`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}年前`;
}

/**
 * 格式化日期为易读格式
 * @param dateString ISO 格式的日期字符串
 * @returns 格式化的日期字符串 (例如: "2024年1月1日")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 格式化时长（秒转换为时:分:秒格式）
 * @param seconds 秒数
 * @returns 格式化的时长字符串 (例如: "1:23:45" 或 "5:30")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
