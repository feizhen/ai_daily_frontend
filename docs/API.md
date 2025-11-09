# AI Daily Backend API 文档

**版本**: 3.3.1
**本地地址**: `http://localhost:3000/api`
**生产环境**: `https://aidailybackend-production.up.railway.app/api`
**总接口数**: 78 个

---

## 📋 目录

- [概述](#概述)
- [身份认证](#身份认证)
- [响应格式](#响应格式)
- [用户管理接口](#用户管理接口)
- [收藏管理接口](#收藏管理接口)
- [新闻接口](#新闻接口)
- [Gmail 接口](#gmail-接口)
- [YouTube 接口](#youtube-接口)
  - [频道管理](#频道管理)
  - [视频管理](#视频管理)
  - [视频摘要（AI 功能）](#视频摘要ai-功能)
  - [用户偏好](#用户偏好)
- [Product Hunt 接口](#product-hunt-接口)
  - [数据同步](#数据同步)
  - [产品查询](#产品查询)
  - [主题相关](#主题相关)
  - [统计信息](#统计信息)
- [数据模型](#数据模型)
- [错误码](#错误码)

---

## 概述

AI Daily Backend 提供以下 RESTful API 服务：
- 📰 从多个邮件源聚合新闻
- 🤖 AI 驱动的内容解析和中英双语生成
- 📊 AI 驱动的排名和排序
- 📧 Gmail 集成用于邮件处理
- 📺 AI 相关频道的 YouTube 视频聚合
- 🎯 基于用户偏好的个性化视频推荐
- 🚀 Product Hunt 热门产品聚合和推荐
- ⚡ 基于 Redis 的缓存提升性能
- 🔐 JWT 双令牌认证系统
- 👥 用户角色权限管理（admin/visitor）

### 🚀 缓存策略

API 实现了 **Redis 缓存**以提升响应速度和减少数据库负载：

- **缓存接口**：
  - `GET /api/youtube/videos` - 默认视频列表（首页）
  - `GET /api/news/top-unpushed` - 顶部未推送新闻（首页）

- **缓存配置**：
  - **TTL (生存时间)**：1 小时 (3600 秒)
  - **失效策略**：基于 TTL 自动过期
  - **降级方案**：Redis 不可用时优雅降级到数据库查询

- **性能提升**：
  - 响应时间：~500ms → ~50ms (提升 90%)
  - 数据库负载减少：90%+
  - 支持更高并发请求

- **缓存键**：
  - YouTube: `youtube:default-videos:{params}`
  - News: `news:top-unpushed:{params}`

---

## 身份认证

### 概述

API 支持基于 **JWT (JSON Web Token)** 的双令牌认证机制（访问令牌 + 刷新令牌）。大部分接口需要认证，部分只读接口保持公开访问。

### 用户角色

系统支持两种用户角色：

- **admin**：管理员角色，拥有完整权限
- **visitor**：访客角色，新注册用户的默认角色

### 认证流程

1. **注册**或**登录**获取令牌
2. 在受保护接口的请求头中**包含访问令牌**
3. 访问令牌过期时使用**刷新令牌**更新
4. **登出**撤销刷新令牌

### 获取令牌

**注册新用户：**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "nickname": "John Doe"  // Optional
}
```

**使用现有凭据登录：**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "John Doe",
      "avatar": null,
      "status": "active",
      "role": "visitor",
      "emailVerified": false,
      "createdAt": "2025-01-06T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**JWT Token Payload 包含：**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "visitor",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### 使用访问令牌

在受保护接口的 `Authorization` 请求头中包含访问令牌：

```http
GET /api/news/:id/push
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 刷新令牌

当访问令牌过期（默认：1 小时）时，使用刷新令牌获取新令牌：

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "令牌刷新成功",
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### Logout

Revoke the Refresh Token to logout:

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Token Lifetimes

- **Access Token**: 1 hour (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token**: 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)

### Password Requirements

- Minimum length: 8 characters
- Must contain: uppercase letter, lowercase letter, and number
- Optional: special characters (@$!%*?&)

### Public Endpoints (No Authentication Required)

The following endpoints are publicly accessible:

**News Endpoints:**
- `GET /news` - List news items
- `GET /news/:id` - Get news item details
- `GET /news/daily/recommendations` - Get daily news recommendations
- `GET /news/rank-stats` - Get ranking statistics
- `POST /news/sync` - Sync operations (for background tasks)
- `POST /news/recalculate-rank` - Recalculate rankings (admin)
- `POST /news/clear` - Clear all news (admin)

**YouTube Endpoints:**
- `GET /api/youtube/channels` - List channels
- `GET /api/youtube/videos` - List videos
- Other read-only YouTube endpoints

**Gmail & Admin Endpoints:**
- All Gmail OAuth endpoints
- System management endpoints

### Protected Endpoints (Authentication Required)

**User Management:**
- `GET /api/auth/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/password` - Change password

**News Operations:**
- `POST /news/:id/push` - Mark news as pushed
- `POST /news/:id/read` - Mark news as read
- `POST /news/:id/like` - Mark news as liked

**YouTube User Preferences:**
- `GET /api/youtube/preferences` - Get user preferences
- `PUT /api/youtube/preferences` - Update user preferences

### Error Responses

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "用户未认证或令牌已过期"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "账号已被禁用"
}
```

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

## 用户管理接口

### 1. 更新个人资料

更新当前登录用户的个人信息。

**端点**: `PATCH /users/profile`

**认证**: 需要（Bearer Token）

**请求体**:
```json
{
  "nickname": "新昵称",
  "avatar": "https://example.com/avatar.jpg"
}
```

**示例请求**:
```bash
PATCH /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "nickname": "AI 爱好者",
  "avatar": "https://example.com/my-avatar.jpg"
}
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nickname": "AI 爱好者",
    "avatar": "https://example.com/my-avatar.jpg",
    "role": "visitor",
    "status": "active",
    "updatedAt": "2025-01-07T10:30:00Z"
  },
  "message": "个人资料更新成功"
}
```

**文件位置**: `src/users/users.controller.ts:22`

---

### 2. 修改密码

修改当前登录用户的密码。

**端点**: `PATCH /users/password`

**认证**: 需要（Bearer Token）

**请求体**:
```json
{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**密码要求**:
- 最少 8 位字符
- 必须包含：大写字母、小写字母、数字
- 可选：特殊字符 (@$!%*?&)

**示例请求**:
```bash
PATCH /users/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "oldPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**示例响应**:
```json
{
  "success": true,
  "message": "密码修改成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "旧密码不正确"
}
```

**文件位置**: `src/users/users.controller.ts:32`

---

## 收藏管理接口

收藏功能支持两种类型：**视频收藏（video）**和**新闻收藏（news）**。

### 3. 添加收藏

将视频或新闻添加到用户收藏夹。

**端点**: `POST /favorites`

**认证**: 需要（Bearer Token）

**请求体**:
```json
{
  "favoriteType": "video",
  "favoriteId": "video-uuid-here"
}
```

**参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `favoriteType` | string | 是 | 收藏类型：`video` 或 `news` |
| `favoriteId` | string | 是 | 视频或新闻的 UUID |

**示例请求**:
```bash
POST /favorites
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "favoriteType": "video",
  "favoriteId": "7ae61a78-07da-4720-8fe5-69b701ef8bec"
}
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "id": "favorite-uuid",
    "userId": "user-uuid",
    "favoriteType": "video",
    "favoriteId": "7ae61a78-07da-4720-8fe5-69b701ef8bec",
    "createdAt": "2025-01-07T10:30:00Z"
  },
  "message": "收藏添加成功"
}
```

**错误响应**（已收藏）:
```json
{
  "success": false,
  "message": "该内容已在收藏夹中"
}
```

**文件位置**: `src/favorites/favorites.controller.ts:36`

---

### 4. 删除收藏

从收藏夹中移除指定项目。

**端点**: `DELETE /favorites/:id`

**认证**: 需要（Bearer Token）

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 收藏记录的 UUID |

**示例请求**:
```bash
DELETE /favorites/7ae61a78-07da-4720-8fe5-69b701ef8bec
Authorization: Bearer <access_token>
```

**示例响应**:
```json
{
  "success": true,
  "message": "收藏已删除"
}
```

**文件位置**: `src/favorites/favorites.controller.ts:54`

---

### 5. 获取收藏列表

获取当前用户的收藏列表，支持分页和类型筛选。

**端点**: `GET /favorites`

**认证**: 需要（Bearer Token）

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `favoriteType` | string | - | 筛选类型：`video` 或 `news` |
| `page` | number | 1 | 页码（从 1 开始）|
| `limit` | number | 20 | 每页数量（最大 100）|

**示例请求**:
```bash
# 获取所有收藏
GET /favorites?page=1&limit=20
Authorization: Bearer <access_token>

# 只获取视频收藏
GET /favorites?favoriteType=video&page=1&limit=10
Authorization: Bearer <access_token>
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "favorite-uuid",
        "favoriteType": "video",
        "favoriteId": "video-uuid",
        "createdAt": "2025-01-07T10:30:00Z",
        "video": {
          "id": "video-uuid",
          "title": "视频标题",
          "thumbnailUrl": "https://...",
          "duration": 1230,
          "author": "频道名称"
        }
      },
      {
        "id": "favorite-uuid-2",
        "favoriteType": "news",
        "favoriteId": "news-uuid",
        "createdAt": "2025-01-07T09:15:00Z",
        "news": {
          "id": "news-uuid",
          "title": { "en": "...", "zh": "..." },
          "category": { "en": "AI RESEARCH", "zh": "人工智能研究" },
          "emoji": "🤖"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

**文件位置**: `src/favorites/favorites.controller.ts:68`

---

### 6. 批量检查收藏状态

批量检查多个内容是否已被收藏（用于前端显示收藏图标状态）。

**端点**: `POST /favorites/check`

**认证**: 需要（Bearer Token）

**请求体**:
```json
{
  "favoriteType": "video",
  "favoriteIds": ["uuid1", "uuid2", "uuid3"]
}
```

**参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `favoriteType` | string | 是 | 收藏类型：`video` 或 `news` |
| `favoriteIds` | string[] | 是 | UUID 数组（最多 100 个）|

**示例请求**:
```bash
POST /favorites/check
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "favoriteType": "video",
  "favoriteIds": [
    "f78651b3-3fb1-4b2a-974b-ec3f7c2a7934",
    "418ef47e-3bd6-4286-8116-1857b9fbf77a",
    "f984f8eb-104b-4029-81df-b349c19a8317"
  ]
}
```

**示例响应**:
```json
{
  "f78651b3-3fb1-4b2a-974b-ec3f7c2a7934": true,
  "418ef47e-3bd6-4286-8116-1857b9fbf77a": true,
  "f984f8eb-104b-4029-81df-b349c19a8317": false
}
```

**响应说明**: 返回一个对象，键为内容 ID，值为布尔值（`true` 表示已收藏，`false` 表示未收藏）。

**验证规则**:
- `favoriteIds` 必须是数组
- 每个 ID 必须是有效的 UUID
- 最多同时检查 100 个收藏状态

**文件位置**: `src/favorites/favorites.controller.ts:82`

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

### 2. Get Daily News ⚡ (Cached)

Get news items for a specific date, sorted by importance ranking. Supports pagination and historical browsing.

**Endpoint**: `GET /news/daily/recommendations`

> **🚀 Performance**: This endpoint is cached for 1 hour. First request queries the database (~500ms), subsequent requests are served from Redis cache (~50ms).

**Query Logic**:
- Returns news created on a **specific date** (based on `created_at` field)
- Sorted by `rank` ascending (lower rank = higher importance)
- Supports pagination for batch push notifications
- Supports historical browsing by specifying date

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | today | Date in YYYY-MM-DD format (e.g., 2025-01-07) |
| `page` | number | 1 | Page number (starting from 1) |
| `limit` | number | 5 | Items per page |

**Example Requests**:
```bash
# Get today's news (default)
GET /news/daily/recommendations

# Get today's news with pagination
GET /news/daily/recommendations?page=1&limit=5

# Get news from a specific date
GET /news/daily/recommendations?date=2025-01-07

# Get second batch from a specific date
GET /news/daily/recommendations?date=2025-01-07&page=2&limit=10
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "items": [/* array of news items */],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 15,
      "totalPages": 3
    },
    "date": "2025-01-07"  // or "today" if no date specified
  }
}
```

**Error Response** (invalid date format):
```json
{
  "success": false,
  "message": "日期格式错误，请使用 YYYY-MM-DD 格式（如 2025-01-07）"
}
```

**Use Cases**:
- **Daily News Feed**: Get all news published today
- **Batch Push Notifications**: Use pagination to send news in multiple batches throughout the day
- **Homepage Display**: Show today's top stories
- **Historical Browsing**: Browse news from previous days by specifying date parameter

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

### 4. Mark as Read

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

### 5. Toggle Like Status

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

### 6. Sync News from The Rundown AI

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

### 7. Sync News from AI Valley

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

### 8. Sync All Sources

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

### 9. Recalculate Rankings

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

### 10. Get Ranking Statistics

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

## Gmail Endpoints

### 11. Get Gmail Auth URL

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

### 14. Authorize Gmail Access

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

### 15. Get Gmail Messages

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

### 16. Get Latest Messages from Sender

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

#### 31. Get All Videos ⚡ (Cached)

Retrieve paginated list of videos with filters.

**Endpoint**: `GET /youtube/videos`

> **🚀 Performance**: This endpoint is cached for 1 hour. First request queries the database (~500ms), subsequent requests are served from Redis cache (~50ms).

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

**文件位置**: `src/youtube/youtube.controller.ts:267`

---

### 视频摘要（AI 功能）

#### 39. 为单个视频生成 AI 摘要（中英双语）

使用 AI 一次性为视频生成**中英文双语摘要**。优先使用字幕（如可用），否则使用视频标题和描述。

**端点**: `POST /youtube/videos/:id/summary`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 视频 UUID |

**摘要策略**:
1. **字幕优先**：如果视频有字幕，使用字幕内容（前 2000 字符）
2. **降级方案**：如果无字幕，使用视频描述（前 500 字符）
3. **一次性生成**：用单个 AI 调用同时生成中英文摘要（节省成本和时间）

**示例请求**:
```bash
POST /youtube/videos/7ae61a78-07da-4720-8fe5-69b701ef8bec/summary
```

**示例响应**（基于字幕）:
```json
{
  "success": true,
  "data": {
    "id": "7ae61a78-07da-4720-8fe5-69b701ef8bec",
    "title": "Understanding Transformers in Deep Learning",
    "aiSummary": "This video provides an in-depth explanation of the Transformer architecture, covering its self-attention mechanism and applications in NLP tasks...",
    "aiSummaryZh": "本视频深入讲解了 Transformer 架构，涵盖其自注意力机制以及在自然语言处理任务中的应用...",
    "transcript": "Welcome to this tutorial...",
    "summaryGeneratedAt": "2025-01-07T10:30:00Z"
  },
  "message": "摘要生成成功（基于字幕）"
}
```

**示例响应**（基于元数据）:
```json
{
  "success": true,
  "data": {
    "id": "7ae61a78-07da-4720-8fe5-69b701ef8bec",
    "title": "Understanding Transformers in Deep Learning",
    "aiSummary": "This video introduces the Transformer model and its key components for modern AI applications...",
    "aiSummaryZh": "本视频介绍了 Transformer 模型及其在现代 AI 应用中的关键组件...",
    "summaryGeneratedAt": "2025-01-07T10:30:00Z"
  },
  "message": "摘要生成成功（基于视频元数据）"
}
```

**响应字段说明**:
- `aiSummary`: 英文摘要（50-100 words）
- `aiSummaryZh`: 中文摘要（50-100 字）
- `transcript`: 视频字幕（如果可用）

**错误响应**:
```json
{
  "success": false,
  "message": "该视频已有完整双语摘要，无需重复生成"
}
```

**性能优势**:
- ✅ 单次 AI 调用生成双语摘要（vs 两次调用）
- ✅ 节省 50% API 成本
- ✅ 提高 40% 生成速度
- ✅ 保证中英文摘要一致性

**文件位置**: `src/youtube/youtube.controller.ts:322`

---

#### 40. 批量生成视频摘要

为多个视频批量生成 AI 摘要，支持并发控制。

**端点**: `POST /youtube/videos/summaries/batch`

**请求体**:
```json
{
  "videoIds": ["uuid1", "uuid2", "uuid3"],
  "concurrency": 5
}
```

**参数说明**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `videoIds` | string[] | - | 视频 UUID 数组 |
| `concurrency` | number | 5 | 并发处理数量（1-10）|

**示例请求**:
```bash
POST /youtube/videos/summaries/batch
Content-Type: application/json

{
  "videoIds": [
    "uuid1",
    "uuid2",
    "uuid3"
  ],
  "concurrency": 3
}
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "total": 3,
    "successful": 2,
    "failed": 1,
    "results": [
      {
        "videoId": "uuid1",
        "success": true,
        "summarySource": "transcript"
      },
      {
        "videoId": "uuid2",
        "success": true,
        "summarySource": "metadata"
      },
      {
        "videoId": "uuid3",
        "success": false,
        "error": "AI 服务暂时不可用"
      }
    ]
  },
  "message": "批量摘要生成完成：2 成功，1 失败"
}
```

**文件位置**: `src/youtube/youtube.controller.ts:336`

---

#### 41. 为所有缺失摘要的视频生成

自动为所有还没有摘要的视频生成 AI 摘要（后台任务）。

**端点**: `POST /youtube/videos/summaries/generate-missing`

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | number | 100 | 最多处理的视频数量 |

**示例请求**:
```bash
# 处理所有缺失摘要的视频（最多 100 个）
POST /youtube/videos/summaries/generate-missing

# 限制处理数量
POST /youtube/videos/summaries/generate-missing?limit=50
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "totalProcessed": 45,
    "successful": 42,
    "failed": 3,
    "remainingWithoutSummary": 0
  },
  "message": "批量摘要生成完成：处理 45 个视频，42 成功，3 失败"
}
```

**使用场景**:
- 首次启用摘要功能时，批量生成历史视频的摘要
- 定时任务自动补充新视频的摘要
- 修复之前失败的摘要生成

**文件位置**: `src/youtube/youtube.controller.ts:355`

---

#### 42. 获取视频摘要统计信息

获取视频摘要功能的使用统计。

**端点**: `GET /youtube/videos/summaries/stats`

**示例请求**:
```bash
GET /youtube/videos/summaries/stats
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "totalVideos": 150,
    "videosWithSummary": 120,
    "videosWithoutSummary": 30,
    "summaryBySource": {
      "transcript": 85,
      "metadata": 35
    },
    "coveragePercentage": 80.0,
    "recentSummaries": [
      {
        "videoId": "uuid",
        "title": "...",
        "summarySource": "transcript",
        "generatedAt": "2025-01-07T10:30:00Z"
      }
    ]
  }
}
```

**统计信息说明**:
- `totalVideos`: 数据库中的总视频数
- `videosWithSummary`: 已生成摘要的视频数
- `videosWithoutSummary`: 尚未生成摘要的视频数
- `summaryBySource`: 按来源分类（字幕 vs 元数据）
- `coveragePercentage`: 摘要覆盖率百分比
- `recentSummaries`: 最近生成的 5 条摘要

**文件位置**: `src/youtube/youtube.controller.ts:370`

---

#### 43. Cleanup Old Videos

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

#### 44. Mark Video as Pushed

Mark a video as pushed for a specific user (creates user-level push history).

**Endpoint**: `POST /youtube/videos/:id/push`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Video UUID |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | string | default | User ID for push history |

**Example Request**:
```bash
POST /youtube/videos/7ae61a78-07da-4720-8fe5-69b701ef8bec/push?userId=default
```

**Example Response**:
```json
{
  "success": true,
  "message": "Video push history created",
  "userId": "default",
  "videoId": "7ae61a78-07da-4720-8fe5-69b701ef8bec"
}
```

---

#### 45. Get Video Push History Statistics

Get user's video push history statistics.

**Endpoint**: `GET /youtube/push-history/stats`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | string | default | User ID |

**Example Request**:
```bash
GET /youtube/push-history/stats?userId=default
```

**Example Response**:
```json
{
  "userId": "default",
  "totalPushed": 300,
  "last7Days": 70,
  "last30Days": 250
}
```

---

#### 46. Calculate Popularity Scores

Manually trigger popularity score calculation for all videos.

**Endpoint**: `POST /youtube/videos/calculate-popularity`

---

#### 47. Health Check

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

## Product Hunt 接口

Product Hunt 模块提供热门产品的聚合、筛选和每日推荐功能。支持按主题、投票数、日期等多种方式查询产品。

### 数据同步

#### 48. 同步今日热门产品

手动触发同步今日 Product Hunt 热门产品。

**端点**: `POST /producthunt/sync/today`

**请求体** (可选):
```json
{
  "limit": 20
}
```

**参数说明**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | number | 20 | 抓取数量 |

**示例请求**:
```bash
POST /producthunt/sync/today
Content-Type: application/json

{
  "limit": 30
}
```

**示例响应**:
```json
{
  "success": true,
  "message": "成功抓取 30 个今日热门产品",
  "count": 30
}
```

**文件位置**: `src/producthunt/producthunt.controller.ts:38`

---

#### 49. 同步 AI 相关产品

手动触发同步 AI 相关的产品（支持多个主题）。

**端点**: `POST /producthunt/sync/ai`

**请求体** (可选):
```json
{
  "daysAgo": 7,
  "limit": 30
}
```

**参数说明**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `daysAgo` | number | 7 | 过去 N 天 |
| `limit` | number | 30 | 每个主题的抓取数量 |

**示例请求**:
```bash
POST /producthunt/sync/ai
Content-Type: application/json

{
  "daysAgo": 7,
  "limit": 20
}
```

**示例响应**:
```json
{
  "success": true,
  "message": "成功抓取 37 个 AI 相关产品",
  "count": 37
}
```

**AI 主题包括**:
- artificial-intelligence
- machine-learning
- developer-tools
- productivity

**文件位置**: `src/producthunt/producthunt.controller.ts:60`

---

### 产品查询

#### 50. 获取今日热门产品

获取今天发布的热门产品（按投票数排序）。

**端点**: `GET /producthunt/today`

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | number | 20 | 返回数量 |

**示例请求**:
```bash
GET /producthunt/today?limit=10
```

**示例响应**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "uuid",
      "productId": "ph-product-id",
      "name": "AI Code Assistant",
      "slug": "ai-code-assistant",
      "tagline": "Your intelligent coding companion",
      "description": "Full product description...",
      "url": "https://www.producthunt.com/posts/...",
      "website": "https://example.com",
      "votesCount": 850,
      "commentsCount": 42,
      "reviewsRating": 4.8,
      "createdAt": "2025-01-07T00:00:00Z",
      "featuredAt": "2025-01-07T08:00:00Z",
      "fetchedAt": "2025-01-07T08:30:00Z",
      "thumbnailUrl": "https://...",
      "media": [
        {
          "type": "image",
          "url": "https://...",
          "videoUrl": null
        }
      ],
      "topics": [
        {
          "id": "topic-uuid",
          "name": "Artificial Intelligence",
          "slug": "artificial-intelligence",
          "description": "...",
          "postsCount": 5420
        }
      ],
      "makers": [
        {
          "id": "maker-uuid",
          "name": "John Doe",
          "username": "johndoe",
          "headline": "Building AI tools",
          "profileImage": "https://...",
          "url": "https://www.producthunt.com/@johndoe"
        }
      ]
    }
  ]
}
```

**文件位置**: `src/producthunt/producthunt.controller.ts:84`

---

#### 51. 获取热门产品列表

获取热门产品，支持多种排序和时间范围筛选。

**端点**: `GET /producthunt/top`

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | number | 20 | 返回数量 |
| `daysAgo` | number | - | 过去 N 天（不指定则查询所有）|
| `sortBy` | string | votes | 排序方式：`votes` 或 `latest` |

**示例请求**:
```bash
# 获取所有时间最热门的 20 个产品
GET /producthunt/top?limit=20&sortBy=votes

# 获取最近 7 天最热门的产品
GET /producthunt/top?limit=10&daysAgo=7&sortBy=votes

# 获取最新产品
GET /producthunt/top?limit=15&sortBy=latest
```

**示例响应**:
```json
{
  "success": true,
  "count": 20,
  "data": [/* 产品数组 */]
}
```

**文件位置**: `src/producthunt/producthunt.controller.ts:106`

---

#### 52. 搜索产品

根据关键词、主题、投票数等条件搜索产品。

**端点**: `GET /producthunt/search`

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `keyword` | string | - | 搜索关键词（在名称、标语、描述中搜索）|
| `limit` | number | 20 | 返回数量 |
| `sortBy` | string | votes | 排序：`votes`、`latest` 或 `rating` |
| `topicSlugs` | string | - | 主题 slug 列表（逗号分隔）|
| `minVotes` | number | - | 最低投票数 |

**示例请求**:
```bash
# 搜索 AI 相关产品
GET /producthunt/search?keyword=ai&limit=20

# 搜索高票数的 AI 工具
GET /producthunt/search?keyword=ai&minVotes=100&sortBy=votes

# 按主题筛选
GET /producthunt/search?topicSlugs=artificial-intelligence,machine-learning&limit=15
```

**示例响应**:
```json
{
  "success": true,
  "count": 15,
  "data": [/* 产品数组 */]
}
```

**文件位置**: `src/producthunt/producthunt.controller.ts:135`

---

#### 53. 根据 ID 获取产品详情

通过产品 UUID 获取单个产品的完整信息。

**端点**: `GET /producthunt/posts/:id`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 产品 UUID |

**示例请求**:
```bash
GET /producthunt/posts/7ae61a78-07da-4720-8fe5-69b701ef8bec
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "id": "7ae61a78-07da-4720-8fe5-69b701ef8bec",
    "name": "AI Code Assistant",
    /* 完整产品信息 */
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "产品不存在"
}
```

**文件位置**: `src/producthunt/producthunt.controller.ts:160`

---

#### 54. 根据 slug 获取产品详情

通过产品 slug 获取单个产品的完整信息。

**端点**: `GET /producthunt/slug/:slug`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `slug` | string | 产品 slug |

**示例请求**:
```bash
GET /producthunt/slug/ai-code-assistant
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "slug": "ai-code-assistant",
    "name": "AI Code Assistant",
    /* 完整产品信息 */
  }
}
```

**文件位置**: `src/producthunt/producthunt.controller.ts:189`

---

#### 55. 获取每日推荐产品

获取指定日期或最近抓取的产品推荐（所有用户获取相同的产品）。

**端点**: `GET /producthunt/daily/recommendations`

**查询逻辑**:
- 基于 `fetchedAt` 字段按日期筛选
- 支持指定具体日期或查询最近 7 天
- 内置兜底逻辑：如果当天无数据，自动回溯前 7 天

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `date` | string | - | 日期（格式：YYYY-MM-DD，不指定则查询最近 7 天）|
| `limit` | number | 20 | 返回数量 |
| `sortBy` | string | votes | 排序方式：`votes` 或 `latest` |

**示例请求**:
```bash
# 获取最近 7 天的推荐（默认）
GET /producthunt/daily/recommendations

# 获取指定日期的产品
GET /producthunt/daily/recommendations?date=2025-01-07

# 获取最新产品（按时间排序）
GET /producthunt/daily/recommendations?sortBy=latest&limit=15
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "posts": [/* 产品数组 */],
    "total": 20,
    "requestedDate": "recent",
    "actualDate": "2025-01-07",
    "isFallback": false
  }
}
```

**兜底逻辑响应** (无当天数据时):
```json
{
  "success": true,
  "data": {
    "posts": [/* 产品数组 */],
    "total": 15,
    "requestedDate": "recent",
    "actualDate": "2025-01-06",
    "isFallback": true
  }
}
```

**错误响应** (日期格式错误):
```json
{
  "success": false,
  "message": "日期格式错误，请使用 YYYY-MM-DD 格式"
}
```

**使用场景**:
- **每日推送**：获取今天抓取的产品用于推送
- **历史浏览**：查看过去某天的产品
- **首页展示**：展示最新的热门产品

**文件位置**: `src/producthunt/producthunt.controller.ts:336`

---

### 主题相关

#### 56. 获取所有主题

获取 Product Hunt 所有主题列表（按产品数量排序）。

**端点**: `GET /producthunt/topics`

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | number | 50 | 返回数量 |

**示例请求**:
```bash
GET /producthunt/topics?limit=30
```

**示例响应**:
```json
{
  "success": true,
  "count": 30,
  "data": [
    {
      "id": "topic-uuid",
      "topicId": "ph-topic-id",
      "name": "Artificial Intelligence",
      "slug": "artificial-intelligence",
      "description": "AI and machine learning products",
      "url": "https://www.producthunt.com/topics/artificial-intelligence",
      "followersCount": 125000,
      "postsCount": 5420
    }
  ]
}
```

**文件位置**: `src/producthunt/producthunt.controller.ts:220`

---

#### 57. 获取 AI 相关主题

获取预定义的 AI 相关主题列表。

**端点**: `GET /producthunt/topics/ai`

**示例请求**:
```bash
GET /producthunt/topics/ai
```

**示例响应**:
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "uuid",
      "name": "Artificial Intelligence",
      "slug": "artificial-intelligence",
      "postsCount": 5420
    },
    {
      "id": "uuid",
      "name": "Machine Learning",
      "slug": "machine-learning",
      "postsCount": 3210
    }
  ]
}
```

**AI 主题包括**:
- artificial-intelligence
- machine-learning
- ai
- deep-learning
- automation
- developer-tools

**文件位置**: `src/producthunt/producthunt.controller.ts:242`

---

#### 58. 根据主题获取产品

获取指定主题下的产品列表。

**端点**: `GET /producthunt/topics/:slug/posts`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `slug` | string | 主题 slug |

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | number | 20 | 返回数量 |
| `sortBy` | string | votes | 排序方式：`votes` 或 `latest` |

**示例请求**:
```bash
# 获取 AI 主题下的热门产品
GET /producthunt/topics/artificial-intelligence/posts?limit=20&sortBy=votes

# 获取 AI 主题下的最新产品
GET /producthunt/topics/artificial-intelligence/posts?sortBy=latest
```

**示例响应**:
```json
{
  "success": true,
  "count": 20,
  "data": [/* 产品数组 */]
}
```

**文件位置**: `src/producthunt/producthunt.controller.ts:261`

---

### 统计信息

#### 59. 获取统计信息

获取 Product Hunt 数据的统计信息。

**端点**: `GET /producthunt/stats`

**示例请求**:
```bash
GET /producthunt/stats
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "totalPosts": 1250,
    "todayPosts": 37,
    "totalTopics": 145,
    "avgVotes": 235,
    "topTopic": "Artificial Intelligence",
    "lastFetchTime": "2025-01-07T08:30:00Z",
    "apiStatus": "active"
  }
}
```

**统计字段说明**:
- `totalPosts`: 数据库中的总产品数
- `todayPosts`: 今天抓取的产品数
- `totalTopics`: 主题总数
- `avgVotes`: 平均投票数
- `topTopic`: 产品数最多的主题
- `lastFetchTime`: 最后一次抓取时间
- `apiStatus`: API 连接状态

**文件位置**: `src/producthunt/producthunt.controller.ts:293`

---

#### 60. 健康检查

检查 Product Hunt 服务状态。

**端点**: `GET /producthunt/health`

**示例请求**:
```bash
GET /producthunt/health
```

**示例响应**:
```json
{
  "success": true,
  "message": "Producthunt service is running",
  "timestamp": "2025-01-07T10:30:00Z"
}
```

**文件位置**: `src/producthunt/producthunt.controller.ts:431`

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
  authorAvatarUrl?: string;            // Channel avatar URL
  duration: number;                    // Duration in seconds
  durationFormatted: string;           // Formatted duration (HH:MM:SS)
  publishedAt: Date;                   // YouTube publish date
  viewCount: number;                   // View count
  likeCount?: number;                  // Like count
  commentCount?: number;               // Comment count
  category: string;                    // Inherited from channel
  tags?: string[];                     // Video tags
  transcript?: string;                 // Video transcript/subtitles
  aiSummary?: string;                  // AI-generated English summary
  aiSummaryZh?: string;                // AI-generated Chinese summary
  relevanceScore: number;              // Calculated relevance (default: 0)
  isPushed: boolean;                   // Push status
  isWatched: boolean;                  // Watched status
  fetchedDate?: Date;                  // Date when video was fetched
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

### NewsUserPreference

```typescript
{
  id: string;                          // UUID (primary key)
  userId: string;                      // User ID ('default' or user UUID)
  preferredCategories: string[];       // Preferred news categories
  dailyNewsCount: number;              // News items per day (1-50)
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Update timestamp
}
```

---

### UserNewsPushHistory

```typescript
{
  id: string;                          // UUID (primary key)
  userId: string;                      // User ID
  newsItemId: string;                  // News item UUID (foreign key)
  pushedAt: Date;                      // Push timestamp
}
```

**Note**: Unique constraint on `(userId, newsItemId)` prevents duplicate pushes.

---

### UserVideoPushHistory

```typescript
{
  id: string;                          // UUID (primary key)
  userId: string;                      // User ID
  videoId: string;                     // Video UUID (foreign key)
  pushedAt: Date;                      // Push timestamp
}
```

**Note**: Unique constraint on `(userId, videoId)` prevents duplicate pushes.

---

### ProducthuntPost

```typescript
{
  id: string;                          // UUID (primary key)
  productId: string;                   // Product Hunt Product ID (unique)
  name: string;                        // Product name
  slug: string;                        // Product slug (unique)
  tagline: string;                     // Short tagline
  description?: string;                // Full description
  url: string;                         // Product Hunt URL
  website?: string;                    // Product website URL
  votesCount: number;                  // Upvote count
  commentsCount: number;               // Comment count
  reviewsRating?: number;              // Average rating (0-5)
  createdAt: Date;                     // Product creation date
  featuredAt?: Date;                   // Featured date on Product Hunt
  fetchedAt: Date;                     // When we fetched this product
  userId?: string;                     // Creator user ID
  thumbnailUrl?: string;               // Thumbnail image URL
  updatedAt: Date;                     // Last update timestamp
  media: ProducthuntMedia[];           // Related media (images/videos)
  topics: ProducthuntTopic[];          // Related topics (many-to-many)
  makers: ProducthuntMaker[];          // Product makers (many-to-many)
}
```

---

### ProducthuntTopic

```typescript
{
  id: string;                          // UUID (primary key)
  topicId: string;                     // Product Hunt Topic ID (unique)
  name: string;                        // Topic name
  slug: string;                        // Topic slug (unique)
  description?: string;                // Topic description
  url?: string;                        // Product Hunt topic URL
  followersCount?: number;             // Follower count
  postsCount?: number;                 // Number of posts in this topic
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Update timestamp
  posts: ProducthuntPost[];            // Related posts (many-to-many)
}
```

---

### ProducthuntMaker

```typescript
{
  id: string;                          // UUID (primary key)
  makerId: string;                     // Product Hunt Maker ID (unique)
  name: string;                        // Maker name
  username?: string;                   // Product Hunt username
  headline?: string;                   // Maker headline/bio
  profileImage?: string;               // Profile image URL
  url?: string;                        // Product Hunt profile URL
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Update timestamp
  posts: ProducthuntPost[];            // Related posts (many-to-many)
}
```

---

### ProducthuntMedia

```typescript
{
  id: string;                          // UUID (primary key)
  postId: string;                      // Foreign key to ProducthuntPost
  type: string;                        // Media type (image/video)
  url: string;                         // Image URL
  videoUrl?: string;                   // Video URL (if type is video)
  createdAt: Date;                     // Creation timestamp
  post: ProducthuntPost;               // Related post
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

---

## Rate Limiting

Currently, there are no rate limits. This may change in production.

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
| Daily Sync | 8:00 AM (Asia/Shanghai) | Sync all sources and recalculate rankings |
| Hourly Rank Update | Every hour | Recalculate rankings for time decay |

### YouTube Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| Daily Video Sync | 7:00 AM (Asia/Shanghai) | Fetch videos from 5 priority channels (max 5 videos per day) using optimized API method |

**优化说明**:
- ✅ 使用优先级频道抓取 (仅 5 个频道)
- ✅ YouTube API 配额消耗：~20 单位/天 (节省 96%)
- ✅ 每天最多 5 个高质量视频
- ✅ 自动计算视频热度分数

---

## Support

For issues or questions:
- GitHub: [Repository URL]
- Documentation: See `NEWS_PROCESSING_FLOW.md` for detailed flow
- Migration Guide: See `MIGRATION.md` for database migrations

---

## 📊 接口统计总览

### 按模块分类

| 模块 | 接口数量 | 主要功能 |
|------|----------|----------|
| **Auth（认证）** | 5 | 注册、登录、刷新令牌、登出、获取用户信息 |
| **Users（用户管理）** | 2 | 更新个人资料、修改密码 |
| **Favorites（收藏）** | 4 | 添加/删除/查询收藏、批量检查收藏状态 |
| **News（新闻）** | 12 | 新闻列表、同步、排名、标记操作、每日推荐 |
| **YouTube（视频）** | 32 | 频道管理、视频管理、摘要生成、用户偏好 |
| **Product Hunt（产品）** | 13 | 产品同步、热门产品、主题筛选、每日推荐 |
| **Gmail（邮件）** | 9 | OAuth 认证、邮件查询、搜索 |
| **App（主应用）** | 1 | 欢迎页面 |
| **总计** | **78** | - |

### 按 HTTP 方法分类

| 方法 | 数量 | 百分比 |
|------|------|--------|
| GET | 44 | 56.4% |
| POST | 29 | 37.2% |
| PATCH | 5 | 6.4% |
| DELETE | 2 | 2.6% |

### 按认证要求分类

| 类型 | 数量 | 百分比 |
|------|------|--------|
| 公开接口 | 72 | 92.3% |
| 需要认证 | 8 | 10.3% |

### 新功能亮点

- ✨ **AI 视频摘要（双语）**：一次性生成中英文双语摘要，基于字幕或元数据，节省 50% API 成本
- ⭐ **收藏系统**：支持视频和新闻的收藏管理，带批量状态检查
- 👤 **用户系统**：完整的认证、授权和个人资料管理
- ⚡ **Redis 缓存**：关键接口实现缓存，响应速度提升 90%
- 🌍 **国际化支持**：新闻和视频摘要全面支持中英双语
- 🚀 **Product Hunt 集成**：每日热门产品聚合、多主题筛选、智能推荐、兜底逻辑

---

**Last Updated**: 2025-01-09
**API Version**: 3.3.1
**Total Endpoints**: 78
