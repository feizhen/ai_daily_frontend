import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      setEmail('');
      setPassword('');
      setNickname('');
      setPopoverOpen(false);
      navigate('/admin/videos');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ email, password, nickname: nickname || undefined });
      setEmail('');
      setPassword('');
      setNickname('');
      setPopoverOpen(false);
      navigate('/admin/videos');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.nickname) {
      return user.nickname.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // 已登录：显示用户菜单
  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
          >
            <span className="text-white font-semibold text-lg">
              {getUserInitials()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.nickname || '用户'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/admin/videos')}>
            📹 视频管理
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/admin/news')}>
            📰 新闻管理
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            🚪 退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 未登录：显示登录/注册 Popover
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
        >
          <span className="text-white font-semibold text-lg">👤</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              {isRegisterMode ? '注册账户' : '登录账户'}
            </h3>
            <p className="text-sm text-gray-500">
              {isRegisterMode ? '创建新账户以访问管理功能' : '登录以访问管理功能'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            {isRegisterMode && (
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称（可选）</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="你的昵称"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              {isRegisterMode && (
                <p className="text-xs text-gray-500">
                  至少 8 个字符，包含大小写字母和数字
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? (isRegisterMode ? '注册中...' : '登录中...')
                : (isRegisterMode ? '注册' : '登录')
              }
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
              disabled={loading}
            >
              {isRegisterMode ? '已有账户？立即登录' : '没有账户？立即注册'}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserMenu;
