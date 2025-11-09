# Token 刷新优化 - 后端配置指南

## 概述

前端已实现主动 Token 刷新机制，为了实现 **30 天登录保持**，需要后端配合调整 Refresh Token 的有效期。

## 当前配置

根据 `docs/API.md` 文档，当前 Token 有效期：

- **Access Token**: 1 小时 (3600 秒)
- **Refresh Token**: 7 天 (604800 秒)

## 需要修改的配置

### 环境变量

在后端项目的 `.env` 文件中修改以下配置：

```bash
# Access Token 有效期 (保持不变)
JWT_EXPIRES_IN=3600  # 1 小时 = 3600 秒

# Refresh Token 有效期 (修改为 30 天)
JWT_REFRESH_EXPIRES_IN=2592000  # 30 天 = 30 * 24 * 60 * 60 = 2592000 秒
```

### 修改说明

| 配置项 | 原值 | 新值 | 说明 |
|--------|------|------|------|
| `JWT_EXPIRES_IN` | 3600 (1小时) | 3600 (不变) | Access Token 保持短期有效，确保安全性 |
| `JWT_REFRESH_EXPIRES_IN` | 604800 (7天) | 2592000 (30天) | Refresh Token 延长至 30 天 |

## 前端优化机制

前端已实现以下优化：

### 1. 主动刷新机制
- **检查频率**: 每分钟检查一次 token 状态
- **刷新时机**: Access Token 过期前 5 分钟自动刷新
- **避免过期**: 用户无需等到请求 401 失败才刷新

### 2. 页面激活检测
- 当用户切换回页面时（从后台返回前台）
- 立即检查 token 是否需要刷新
- 确保长时间未活跃后也能正常使用

### 3. 智能防重复
- 防止多个请求同时触发刷新
- 使用订阅者模式管理并发刷新
- 刷新失败时自动清理登录状态

## 工作流程

```
用户登录
  ↓
存储 tokens (localStorage)
  ↓
启动刷新管理器
  ↓
[每分钟检查]
  ↓
Access Token 剩余时间 < 5分钟?
  ↓ (是)
调用 /api/auth/refresh
  ↓
获取新的 Access + Refresh Token
  ↓
更新 localStorage
  ↓
[继续检查循环]
  ↓
[30 天后]
Refresh Token 过期
  ↓
刷新失败 → 自动登出 → 需要重新登录
```

## 安全性考虑

### 为什么可以延长 Refresh Token 有效期？

1. **Refresh Token 存储在 localStorage**
   - 仅在同源域名下可访问
   - 现代浏览器的同源策略保护

2. **Refresh Token 一次性使用**
   - 每次刷新都会生成新的 Refresh Token
   - 旧的 Refresh Token 立即失效
   - 防止 Token 重放攻击

3. **Access Token 仍然短期**
   - 实际 API 请求使用的是 Access Token
   - Access Token 有效期仍为 1 小时
   - 即使泄露，影响也很有限

4. **后端有撤销机制**
   - 登出时会撤销 Refresh Token
   - 后端可以主动使 Token 失效
   - 异常情况下可以强制所有用户重新登录

## 测试建议

### 前端测试

1. **登录后观察控制台**
   ```
   [TokenRefreshManager] Started
   [TokenRefreshManager] Token still valid (3599s remaining)
   ```

2. **等待接近刷新时间（55分钟后）**
   ```
   [TokenRefreshManager] Token expiring soon (280s remaining), refreshing...
   [TokenRefreshManager] Token refreshed successfully
   ```

3. **切换标签页再返回**
   ```
   [TokenRefreshManager] Page became visible, checking token
   ```

### 后端测试

1. 修改环境变量后重启后端服务
2. 使用 JWT 解码工具验证新 token 的 `exp` 字段
3. 确认 `exp` - `iat` = 2592000 (30天)

## 常见问题

### Q: 为什么不直接延长 Access Token 有效期？
A: Access Token 用于每次 API 请求，短期有效更安全。如果被窃取，影响时间有限。

### Q: 30 天是否太长？
A: 对于个人使用的应用，30 天是合理的平衡点。如果是企业应用，可以考虑 7-14 天。

### Q: 用户会被自动登出吗？
A: 只有在 30 天内完全没有访问应用的情况下才会需要重新登录。

### Q: 如何验证配置是否生效？
A:
1. 前端：查看浏览器控制台的刷新日志
2. 后端：解码 JWT token，检查 `exp` 字段
3. 测试：登录后查看 localStorage 中的 token

## 总结

- ✅ **前端**: 已实现主动刷新机制，无需修改
- ⚙️ **后端**: 只需修改一个环境变量 `JWT_REFRESH_EXPIRES_IN=2592000`
- 🎯 **目标**: 实现 30 天登录保持
- 🔒 **安全**: 保持 Access Token 短期，Refresh Token 长期的安全模型
