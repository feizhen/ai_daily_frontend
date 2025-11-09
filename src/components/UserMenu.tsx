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

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login({ email, password });
      setEmail('');
      setPassword('');
      setNickname('');
      setPopoverOpen(false);

      // Only redirect to admin page if user has admin role
      if (loggedInUser.role === 'admin') {
        navigate('/admin/videos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registeredUser = await register({ email, password, nickname: nickname || undefined });
      setEmail('');
      setPassword('');
      setNickname('');
      setPopoverOpen(false);

      // Only redirect to admin page if user has admin role
      if (registeredUser.role === 'admin') {
        navigate('/admin/videos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLogoutLoading(false);
    }
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
    const isAdmin = user?.role === 'admin';

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
          >
            <span className="text-white font-semibold text-lg">
              {getUserInitials()}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="p-2">
            {/* User Info Section */}
            <div className="text-center mb-5">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-semibold text-2xl">
                  {getUserInitials()}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {user?.nickname || 'User'}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {user?.email}
              </p>
              {isAdmin && (
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                  Admin
                </span>
              )}
            </div>

            {/* Admin Links - Only show for admin users */}
            {isAdmin && (
              <>
                <div className="mb-5">
                  <button
                    onClick={() => navigate('/admin/videos')}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3"
                  >
                    <span className="text-xl">📹</span>
                    <span className="font-medium">Video Management</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/news')}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3"
                  >
                    <span className="text-xl">📰</span>
                    <span className="font-medium">News Management</span>
                  </button>
                </div>
              </>
            )}

            {/* Sign Out Button */}
            <Button
              onClick={handleLogout}
              className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-10 font-medium"
              disabled={logoutLoading}
            >
              {logoutLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
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
        <div className="p-2">
          <div className="text-center mb-5">
            <h3 className="text-xl font-semibold mb-2">
              {isRegisterMode ? 'Sign Up' : 'Sign In'}
            </h3>
            <p className="text-sm text-gray-500">
              {isRegisterMode ? 'Create an account to access admin features' : 'Sign in to access admin features'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin}>
            {isRegisterMode && (
              <div className="mb-5">
                <Label htmlFor="nickname" className="text-sm font-medium mb-2 block">Nickname (Optional)</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Your nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-10 px-4"
                />
              </div>
            )}

            <div className="mb-5">
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl h-10 px-4"
              />
            </div>

            <div className="mb-5">
              <Label htmlFor="password" className="text-sm font-medium mb-2 block">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl h-10 px-4"
              />
              {isRegisterMode && (
                <p className="text-xs text-gray-500 mt-2">
                  At least 8 characters with uppercase, lowercase and numbers
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-10 font-medium mb-5"
              disabled={loading}
            >
              {loading
                ? (isRegisterMode ? 'Signing up...' : 'Signing in...')
                : (isRegisterMode ? 'Sign Up' : 'Sign In')
              }
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-black/60 hover:text-black/80 hover:underline"
              disabled={loading}
            >
              {isRegisterMode ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserMenu;
