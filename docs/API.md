# AI Daily Backend API Documentation

**Version**: 2.0.0
**Base URL**: `http://localhost:3000/api`
**Production URL**: `https://aidailybackend-production.up.railway.app/api`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [News Endpoints](#news-endpoints)
- [Translation Endpoints](#translation-endpoints)
- [Gmail Endpoints](#gmail-endpoints)
- [YouTube Endpoints](#youtube-endpoints)
  - [Channel Management](#channel-management)
  - [Video Management](#video-management)
  - [User Preferences](#user-preferences)
- [Data Models](#data-models)
- [Error Codes](#error-codes)

---

## Overview

AI Daily Backend provides RESTful APIs for:
- 📰 News aggregation from multiple email sources
- 🌐 Batch translation with intelligent retry mechanisms
- 📊 AI-powered ranking and sorting
- 📧 Gmail integration for email processing
- 📺 YouTube video aggregation from AI-related channels
- 🎯 Personalized video recommendations based on user preferences

---

## Authentication

Currently, the API does not require authentication. This may change in future versions.

---

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## News Endpoints

### 1. Get News List

Retrieve paginated list of news items with optional filters.

**Endpoint**: `GET /news`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `isPushed` | boolean | - | Filter by push status |
| `isRead` | boolean | - | Filter by read status |
| `isLiked` | boolean | - | Filter by like status |
| `sortBy` | string | rank | Sort field (rank, created_at, etc.) |
| `order` | string | ASC | Sort order (ASC or DESC) |

**Example Request**:
```bash
GET /news?page=1&limit=10&isPushed=false&sortBy=rank&order=ASC
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "category": { "en": "AI RESEARCH", "zh": "人工智能研究" },
        "title": { "en": "...", "zh": "..." },
        "emoji": "🤖",
        "url": "https://...",
        "imageUrl": "https://...",
        "summary": { "en": "...", "zh": "..." },
        "details": { "en": [...], "zh": [...] },
        "significance": { "en": "...", "zh": "..." },
        "sourceEmailId": "...",
        "sourceEmailDate": "2025-11-03T00:00:00.000Z",
        "isPushed": false,
        "isRead": false,
        "isLiked": false,
        "pushedAt": null,
        "readAt": null,
        "likedAt": null,
        "createdAt": "2025-11-03T00:00:00.000Z",
        "updatedAt": "2025-11-03T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

### 2. Get Top Unpushed News

Get the highest-ranked unpushed news items.

**Endpoint**: `GET /news/top-unpushed`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 5 | Maximum items to return |

**Example Request**:
```bash
GET /news/top-unpushed?limit=5
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "items": [/* array of news items */],
    "total": 5
  }
}
```

---

### 3. Get News by ID

Retrieve a single news item by its UUID.

**Endpoint**: `GET /news/:id`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | News item UUID |

**Example Request**:
```bash
GET /news/7ae61a78-07da-4720-8fe5-69b701ef8bec
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "7ae61a78-07da-4720-8fe5-69b701ef8bec",
    "category": { "en": "ROBOTICS", "zh": "机器人" },
    "title": { "en": "...", "zh": "..." },
    /* ... full news item ... */
  }
}
```

---

### 4. Mark as Pushed

Mark a news item as pushed.

**Endpoint**: `POST /news/:id/push`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | News item UUID |

**Example Request**:
```bash
POST /news/7ae61a78-07da-4720-8fe5-69b701ef8bec/push
```

**Example Response**:
```json
{
  "success": true,
  "data": {/* updated news item */},
  "message": "已标记为推送"
}
```

---

### 5. Mark as Read

Mark a news item as read.

**Endpoint**: `POST /news/:id/read`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | News item UUID |

**Example Request**:
```bash
POST /news/7ae61a78-07da-4720-8fe5-69b701ef8bec/read
```

**Example Response**:
```json
{
  "success": true,
  "data": {/* updated news item */},
  "message": "已标记为已读"
}
```

---

### 6. Toggle Like Status

Toggle or set the like status of a news item.

**Endpoint**: `POST /news/:id/like`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | News item UUID |

**Request Body** (optional):
```json
{
  "liked": true
}
```

**Example Request**:
```bash
POST /news/7ae61a78-07da-4720-8fe5-69b701ef8bec/like
Content-Type: application/json

{
  "liked": true
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {/* updated news item */},
  "message": "已添加到喜欢"
}
```

---

### 7. Sync News from The Rundown AI

Manually trigger email synchronization from The Rundown AI.

**Endpoint**: `POST /news/sync`

**Request Body** (optional):
```json
{
  "maxResults": 5
}
```

**Example Request**:
```bash
POST /news/sync
Content-Type: application/json

{
  "maxResults": 5
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "totalEmails": 5,
    "newItems": 12,
    "duplicates": 3
  },
  "message": "同步完成：处理 5 封邮件，新增 12 条消息，跳过 3 条重复"
}
```

---

### 8. Sync News from AI Valley

Manually trigger email synchronization from AI Valley.

**Endpoint**: `POST /news/sync/aivalley`

**Request Body** (optional):
```json
{
  "maxResults": 3
}
```

**Example Request**:
```bash
POST /news/sync/aivalley
Content-Type: application/json

{
  "maxResults": 3
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "totalEmails": 3,
    "newItems": 8,
    "duplicates": 1
  },
  "message": "AI Valley 同步完成：处理 3 封邮件，新增 8 条消息，跳过 1 条重复"
}
```

---

### 9. Sync All Sources

Sync news from all configured email sources.

**Endpoint**: `POST /news/sync/all`

**Request Body** (optional):
```json
{
  "maxResults": 3
}
```

**Example Request**:
```bash
POST /news/sync/all
Content-Type: application/json

{
  "maxResults": 3
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "rundown": {
      "totalEmails": 3,
      "newItems": 7,
      "duplicates": 1
    },
    "aiValley": {
      "totalEmails": 3,
      "newItems": 5,
      "duplicates": 0
    },
    "total": {
      "totalEmails": 6,
      "newItems": 12,
      "duplicates": 1
    }
  },
  "message": "全部同步完成：处理 6 封邮件，新增 12 条消息，跳过 1 条重复"
}
```

---

### 10. Recalculate Rankings

Manually trigger ranking recalculation for all unpushed news.

**Endpoint**: `POST /news/recalculate-rank`

**Example Request**:
```bash
POST /news/recalculate-rank
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "rankedCount": 100,
    "stats": {
      "totalUnpushed": 100,
      "avgScore": 5.32,
      "topScore": 9.50,
      "bottomScore": 2.10
    }
  },
  "message": "已重新计算 100 条新闻的排名"
}
```

---

### 11. Get Ranking Statistics

Get statistics about current news rankings.

**Endpoint**: `GET /news/rank-stats`

**Example Request**:
```bash
GET /news/rank-stats
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "totalUnpushed": 100,
    "avgScore": 5.32,
    "topScore": 9.50,
    "bottomScore": 2.10
  }
}
```

---

## Translation Endpoints

### 12. Batch Translate Pending News

Translate all news items with `translation_status = 'pending'`.

**Endpoint**: `POST /news/translate/pending`

**Request Body** (optional):
```json
{
  "limit": 50
}
```

**Example Request**:
```bash
POST /news/translate/pending
Content-Type: application/json

{
  "limit": 50
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "translatedCount": 45
  },
  "message": "翻译完成：成功翻译 45 条新闻"
}
```

**Translation Process**:
1. Queries news items with `translation_status = 'pending'`
2. Updates status to `'translating'`
3. Attempts batch translation with retry mechanism
4. Falls back to individual translation if batch fails
5. Updates status to `'completed'` or `'failed'`
6. Sets `translated_at` timestamp on success

---

### 13. Retranslate Single News Item

Retry translation for a single news item (useful for failed translations).

**Endpoint**: `POST /news/:id/retranslate`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | News item UUID |

**Example Request**:
```bash
POST /news/7ae61a78-07da-4720-8fe5-69b701ef8bec/retranslate
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    /* fully translated news item */
  },
  "message": "重新翻译成功"
}
```

---

## Gmail Endpoints

### 14. Get Gmail Auth URL

Get OAuth2 authorization URL for Gmail access.

**Endpoint**: `GET /gmail/auth-url`

**Example Request**:
```bash
GET /gmail/auth-url
```

**Example Response**:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

---

### 15. Authorize Gmail Access

Exchange authorization code for access token.

**Endpoint**: `POST /gmail/authorize`

**Request Body**:
```json
{
  "code": "authorization_code_from_google"
}
```

**Example Request**:
```bash
POST /gmail/authorize
Content-Type: application/json

{
  "code": "4/0AY0e-g7..."
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Authorization successful"
}
```

---

### 16. Get Gmail Messages

Retrieve messages from Gmail inbox.

**Endpoint**: `GET /gmail/messages`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxResults` | number | 10 | Maximum messages to retrieve |
| `query` | string | - | Gmail search query |

**Example Request**:
```bash
GET /gmail/messages?maxResults=10&query=from:news@daily.therundown.ai
```

---

### 17. Get Latest Messages from Sender

Get the latest messages from a specific sender.

**Endpoint**: `GET /gmail/latest-from`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sender` | string | (required) | Email address of sender |
| `maxResults` | number | 5 | Maximum messages to retrieve |

**Example Request**:
```bash
GET /gmail/latest-from?sender=news@daily.therundown.ai&maxResults=5
```

---

## YouTube Endpoints

### Channel Management

#### 18. Add Single Channel

Add a new YouTube channel to track.

**Endpoint**: `POST /youtube/channels`

**Request Body**:
```json
{
  "channelId": "UCbfYPyITQ-7l4upoX8nvctg",
  "channelUrl": "https://www.youtube.com/@TwoMinutePapers",
  "category": "tech"
}
```

**Example Response**:
```json
{
  "id": "uuid",
  "channelId": "UCbfYPyITQ-7l4upoX8nvctg",
  "channelName": "Two Minute Papers",
  "channelUrl": "https://www.youtube.com/@TwoMinutePapers",
  "category": "tech",
  "thumbnailUrl": "https://...",
  "subscriberCount": 1740000,
  "isActive": true,
  "createdAt": "2025-11-04T08:13:39.121Z"
}
```

---

#### 19. Add Multiple Channels (Batch)

Add multiple YouTube channels at once.

**Endpoint**: `POST /youtube/channels/batch`

**Request Body**:
```json
{
  "channels": [
    {
      "channelId": "UCbfYPyITQ-7l4upoX8nvctg",
      "channelUrl": "https://www.youtube.com/@TwoMinutePapers",
      "category": "tech"
    },
    {
      "channelId": "UCNJ1Ymd5yFuUPtn21xtRbbw",
      "channelUrl": "https://www.youtube.com/@aiexplained-official",
      "category": "tech"
    }
  ]
}
```

**Example Response**:
```json
[
  {/* channel 1 details */},
  {/* channel 2 details */}
]
```

---

#### 20. Get All Channels

Retrieve all YouTube channels, optionally filtered by category.

**Endpoint**: `GET /youtube/channels`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category (tech/product/market) |

**Example Request**:
```bash
GET /youtube/channels?category=tech
```

**Example Response**:
```json
[
  {
    "id": "uuid",
    "channelId": "UCbfYPyITQ-7l4upoX8nvctg",
    "channelName": "Two Minute Papers",
    "channelUrl": "https://www.youtube.com/@TwoMinutePapers",
    "category": "tech",
    "subscriberCount": 1740000,
    "isActive": true
  }
]
```

---

#### 21. Get Channel Statistics

Get statistics about all channels.

**Endpoint**: `GET /youtube/channels/stats/all`

**Example Response**:
```json
{
  "totalChannels": 19,
  "activeChannels": 19,
  "inactiveChannels": 0,
  "byCategory": [
    { "category": "tech", "count": "9" },
    { "category": "product", "count": "4" },
    { "category": "market", "count": "6" }
  ]
}
```

---

#### 22. Get Default Channel List

View the hardcoded default channel list without importing.

**Endpoint**: `GET /youtube/channels/default-list`

**Example Response**:
```json
{
  "total": 19,
  "stats": {
    "total": 19,
    "tech": 9,
    "product": 4,
    "market": 6
  },
  "channels": [
    {
      "channelId": "UCbfYPyITQ-7l4upoX8nvctg",
      "channelUrl": "https://www.youtube.com/@TwoMinutePapers",
      "category": "tech",
      "description": "AI 和计算机图形学论文解读"
    }
  ]
}
```

---

#### 23. Initialize Default Channels

Import default channels (skips if channels already exist).

**Endpoint**: `POST /youtube/channels/init`

**Example Response**:
```json
{
  "success": true,
  "message": "Default channels initialization triggered"
}
```

---

#### 24. Reimport Default Channels

Force reimport of default channels.

**Endpoint**: `POST /youtube/channels/reimport`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `force` | boolean | Force reimport even if channels exist |

**Example Request**:
```bash
POST /youtube/channels/reimport?force=true
```

**Example Response**:
```json
{
  "success": true,
  "imported": 19,
  "failed": 0,
  "channels": [/* array of imported channels */]
}
```

---

#### 25. Get Channel by ID

Retrieve a single channel by UUID.

**Endpoint**: `GET /youtube/channels/:id`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Channel UUID |

---

#### 26. Update Channel

Update channel details.

**Endpoint**: `PATCH /youtube/channels/:id`

**Request Body**:
```json
{
  "category": "market",
  "isActive": true
}
```

---

#### 27. Delete Channel

Delete a channel and all its videos.

**Endpoint**: `DELETE /youtube/channels/:id`

---

#### 28. Toggle Channel Status

Enable or disable a channel.

**Endpoint**: `PATCH /youtube/channels/:id/toggle`

**Example Response**:
```json
{
  "id": "uuid",
  "channelName": "Two Minute Papers",
  "isActive": false
}
```

---

#### 29. Refresh Channel Info

Refresh channel metadata from YouTube API.

**Endpoint**: `POST /youtube/channels/:id/refresh`

---

### Video Management

#### 30. Sync Videos

Manually trigger video synchronization from all active channels.

**Endpoint**: `POST /youtube/videos/sync`

**Request Body** (optional):
```json
{
  "hoursAgo": 24,
  "maxVideosPerChannel": 10,
  "category": "tech"
}
```

**Example Response**:
```json
{
  "totalVideos": 12,
  "newVideos": 7,
  "channels": 19,
  "videos": [/* array of fetched videos */]
}
```

---

#### 31. Get All Videos

Retrieve paginated list of videos with filters.

**Endpoint**: `GET /youtube/videos`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `category` | string | - | Filter by category |
| `minDuration` | number | - | Minimum duration (seconds) |
| `maxDuration` | number | - | Maximum duration (seconds) |
| `isPushed` | boolean | - | Filter by push status |
| `isWatched` | boolean | - | Filter by watched status |
| `sortBy` | string | publishedAt | Sort field |
| `order` | string | DESC | Sort order |

**Example Request**:
```bash
GET /youtube/videos?category=tech&limit=10&sortBy=viewCount&order=DESC
```

**Example Response**:
```json
[
  {
    "id": "uuid",
    "videoId": "ws0nlxCWWI8",
    "title": "Faster R-CNN - Explained!",
    "author": "CodeEmporium",
    "duration": 1730,
    "durationFormatted": "28:50",
    "thumbnailUrl": "https://...",
    "embedUrl": "https://www.youtube.com/embed/ws0nlxCWWI8",
    "publishedAt": "2025-11-03T15:01:50.000Z",
    "viewCount": "287",
    "likeCount": 14,
    "category": "market",
    "isPushed": false,
    "isWatched": false,
    "channel": {/* channel details */}
  }
]
```

---

#### 32. Search Videos

Search videos by keywords in title, description, or tags.

**Endpoint**: `GET /youtube/videos/search`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search keywords |
| `limit` | number | No | Max results (default: 20) |
| `category` | string | No | Filter by category |

**Example Request**:
```bash
GET /youtube/videos/search?query=transformer&limit=10
```

---

#### 33. Get Video by ID

Retrieve a single video with full details.

**Endpoint**: `GET /youtube/videos/:id`

---

#### 34. Get Daily Recommendations

Get personalized daily video recommendations based on user preferences.

**Endpoint**: `GET /youtube/videos/daily/recommendations`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | string | default | User ID for preferences |

**Example Response**:
```json
{
  "date": "2025-11-04",
  "totalVideos": 10,
  "videos": [/* array of recommended videos */]
}
```

---

#### 35. Preview Recommendations

Preview what videos would be recommended with current preferences.

**Endpoint**: `GET /youtube/videos/recommendations/preview`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | string | default | User ID for preferences |

---

#### 36. Mark Video as Watched

Mark a video as watched.

**Endpoint**: `PATCH /youtube/videos/:id/watched`

**Request Body**:
```json
{
  "watched": true
}
```

---

#### 37. Batch Mark as Watched

Mark multiple videos as watched at once.

**Endpoint**: `POST /youtube/videos/watched/batch`

**Request Body**:
```json
{
  "videoIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

#### 38. Refresh Video Statistics

Refresh view count, likes, etc. from YouTube API.

**Endpoint**: `POST /youtube/videos/:videoId/refresh-stats`

---

#### 39. Cleanup Old Videos

Delete videos older than configured retention period.

**Endpoint**: `DELETE /youtube/videos/cleanup`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `daysToKeep` | number | Override default retention days |

---

#### 40. Reset Push Status

Reset isPushed flag for all videos (useful for testing).

**Endpoint**: `POST /youtube/videos/reset-push-status`

---

#### 41. Get Video Statistics

Get statistics about all videos.

**Endpoint**: `GET /youtube/videos/stats/all`

**Example Response**:
```json
{
  "totalVideos": 12,
  "pushedVideos": 2,
  "watchedVideos": 0,
  "recentVideos": 5,
  "byCategory": [
    { "category": "tech", "count": "4" },
    { "category": "product", "count": "3" },
    { "category": "market", "count": "5" }
  ]
}
```

---

### User Preferences

#### 42. Get User Preferences

Get user's video preferences.

**Endpoint**: `GET /youtube/preferences`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | string | default | User ID |

**Example Response**:
```json
{
  "userId": "default",
  "preferredCategories": ["tech", "product"],
  "minDuration": 300,
  "maxDuration": 1800,
  "dailyVideoCount": 10,
  "sortBy": "relevance",
  "onlyUnwatched": true
}
```

---

#### 43. Update User Preferences

Update user's video preferences.

**Endpoint**: `PUT /youtube/preferences`

**Request Body**:
```json
{
  "userId": "default",
  "preferredCategories": ["tech", "market"],
  "minDuration": 600,
  "maxDuration": 2400,
  "dailyVideoCount": 15,
  "sortBy": "viewCount",
  "onlyUnwatched": true
}
```

---

#### 44. Calculate Popularity Scores

Manually trigger popularity score calculation for all videos.

**Endpoint**: `POST /youtube/videos/calculate-popularity`

---

#### 45. Health Check

Check YouTube service health and API quota status.

**Endpoint**: `GET /youtube/health`

**Example Response**:
```json
{
  "status": "healthy",
  "apiKey": "configured",
  "channelsCount": 19,
  "videosCount": 12,
  "lastSync": "2025-11-04T08:32:09.000Z"
}
```

---

## Data Models

### NewsItem

```typescript
{
  id: string;                          // UUID
  category: {
    en: string;                        // English category
    zh: string;                        // Chinese category
  };
  title: {
    en: string;                        // English title
    zh: string;                        // Chinese title
  };
  emoji: string;                       // Single emoji icon
  url: string;                         // Source URL
  imageUrl: string;                    // Image URL
  summary: {
    en: string;                        // English summary
    zh: string;                        // Chinese summary
  };
  details: {
    en: string[];                      // English detail points
    zh: string[];                      // Chinese detail points
  };
  significance: {
    en: string;                        // English significance
    zh: string;                        // Chinese significance
  };
  sourceEmailId: string;               // Source email ID (unique)
  sourceEmailDate: Date;               // Email date
  isPushed: boolean;                   // Push status
  isRead: boolean;                     // Read status
  isLiked: boolean;                    // Like status
  pushedAt: Date | null;               // Push timestamp
  readAt: Date | null;                 // Read timestamp
  likedAt: Date | null;                // Like timestamp
  translationStatus?: string;          // Translation status
  translatedAt?: Date | null;          // Translation timestamp
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Update timestamp
}
```

### Translation Status Values

| Status | Description |
|--------|-------------|
| `pending` | Waiting for translation |
| `translating` | Translation in progress |
| `completed` | Translation successful |
| `failed` | Translation failed (can retry) |

---

### YoutubeChannel

```typescript
{
  id: string;                          // UUID
  channelId: string;                   // YouTube Channel ID (unique)
  channelName: string;                 // Channel display name
  channelUrl: string;                  // Channel URL
  category: string;                    // tech | product | market
  description?: string;                // Channel description
  thumbnailUrl?: string;               // Channel avatar/logo
  subscriberCount?: number;            // Subscriber count
  isActive: boolean;                   // Whether to fetch videos
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Update timestamp
}
```

---

### YoutubeVideo

```typescript
{
  id: string;                          // UUID
  videoId: string;                     // YouTube Video ID (unique)
  channelId: string;                   // Foreign key to Channel
  title: string;                       // Video title
  description?: string;                // Video description
  thumbnailUrl: string;                // Thumbnail image URL
  embedUrl: string;                    // URL for iframe embed
  author: string;                      // Channel author name
  duration: number;                    // Duration in seconds
  durationFormatted: string;           // Formatted duration (HH:MM:SS)
  publishedAt: Date;                   // YouTube publish date
  viewCount: string;                   // View count
  likeCount?: number;                  // Like count
  commentCount?: number;               // Comment count
  category: string;                    // Inherited from channel
  tags?: string[];                     // Video tags
  transcript?: string;                 // Video transcript (future)
  aiSummary?: string;                  // AI-generated summary (future)
  relevanceScore: number;              // Calculated relevance (default: 0)
  isPushed: boolean;                   // Push status
  isWatched: boolean;                  // Watched status
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Update timestamp
  channel: YoutubeChannel;             // Relation to channel
}
```

---

### YoutubeUserPreference

```typescript
{
  userId: string;                      // User ID (primary key)
  preferredCategories: string[];       // Preferred categories array
  minDuration: number;                 // Minimum video duration (seconds)
  maxDuration: number;                 // Maximum video duration (seconds)
  dailyVideoCount: number;             // Videos per day
  sortBy: string;                      // Sort preference
  onlyUnwatched: boolean;              // Filter unwatched only
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Update timestamp
}
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

**Common Error Messages**:
- `"消息不存在"` - News item not found
- `"同步失败"` - Sync operation failed
- `"翻译失败"` - Translation failed
- `"批量翻译失败"` - Batch translation failed

---

## Rate Limiting

Currently, there are no rate limits. This may change in production.

---

## Translation Service

The translation service uses a multi-tier fallback system:

1. **Primary**: Doubao AI (豆包大模型)
2. **Fallback 1**: OpenAI GPT-4o-mini
3. **Fallback 2**: Google Cloud Translate

**Retry Strategy**:
- Batch translation: 3 attempts with exponential backoff (2s, 4s, 6s)
- Individual translation: 3 attempts with linear backoff (1s, 2s, 3s)
- Automatic fallback from batch to individual if batch fails

---

## Ranking Algorithm

News items are ranked using this formula:

```
final_score = importance_score × e^(-age_days / 3)
```

Where:
- `importance_score`: 1-10 (AI-generated or default 5.0)
- `age_days`: Days since `source_email_date`
- Half-life: 3 days

Lower `rank` values indicate higher priority (rank 1 is highest).

---

## Scheduled Tasks

### News Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| Daily Sync | 8:00 AM (Asia/Shanghai) | Sync all sources, rank, translate |
| Hourly Rank Update | Every hour | Recalculate rankings for time decay |

### YouTube Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| Daily Video Sync | 7:00 AM (Asia/Shanghai) | Fetch latest videos (24 hours) from all active channels |
| Popularity Update | Every 6 hours | Recalculate popularity scores for all videos |
| Weekly Cleanup | Sunday 2:00 AM | Delete videos older than retention period (default: 30 days) |

---

## Support

For issues or questions:
- GitHub: [Repository URL]
- Documentation: See `NEWS_PROCESSING_FLOW.md` for detailed flow
- Migration Guide: See `MIGRATION.md` for database migrations

---

**Last Updated**: 2025-11-04
**API Version**: 3.0.0