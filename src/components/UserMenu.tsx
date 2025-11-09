import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, type Language } from '../contexts/LanguageContext';
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
  const { language, setLanguage, t } = useLanguage();
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
                    <span className="font-medium">{t('userMenu.videoManagement')}</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/news')}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3"
                  >
                    <span className="text-xl">📰</span>
                    <span className="font-medium">{t('userMenu.newsManagement')}</span>
                  </button>
                </div>
              </>
            )}

            {/* Language Selector */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-500 mb-2">{t('userMenu.language')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('language.en')}
                </button>
                <button
                  onClick={() => setLanguage('zh')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    language === 'zh'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('language.zh')}
                </button>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              onClick={handleLogout}
              className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-10 font-medium"
              disabled={logoutLoading}
            >
              {logoutLoading ? t('userMenu.signingOut') : t('userMenu.signOut')}
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
              {isRegisterMode ? t('userMenu.signUp') : t('userMenu.signIn')}
            </h3>
            <p className="text-sm text-gray-500">
              {isRegisterMode ? t('userMenu.signUpPrompt') : t('userMenu.signInPrompt')}
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
                <Label htmlFor="nickname" className="text-sm font-medium mb-2 block">{t('userMenu.nickname')}</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder={t('userMenu.nicknamePlaceholder')}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-10 px-4"
                />
              </div>
            )}

            <div className="mb-5">
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">{t('userMenu.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('userMenu.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl h-10 px-4"
              />
            </div>

            <div className="mb-5">
              <Label htmlFor="password" className="text-sm font-medium mb-2 block">{t('userMenu.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('userMenu.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl h-10 px-4"
              />
              {isRegisterMode && (
                <p className="text-xs text-gray-500 mt-2">
                  {t('userMenu.passwordHint')}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-10 font-medium mb-5"
              disabled={loading}
            >
              {loading
                ? (isRegisterMode ? t('userMenu.signingUp') : t('userMenu.signingIn'))
                : (isRegisterMode ? t('userMenu.signUp') : t('userMenu.signIn'))
              }
            </Button>
          </form>

          <div className="text-center mb-5">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-black/60 hover:text-black/80 hover:underline"
              disabled={loading}
            >
              {isRegisterMode ? t('userMenu.alreadyHaveAccount') : t('userMenu.noAccount')}
            </button>
          </div>

          {/* Language Selector for unauthenticated users */}
          <div className="pt-5 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">{t('userMenu.language')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('language.en')}
              </button>
              <button
                onClick={() => setLanguage('zh')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  language === 'zh'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('language.zh')}
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserMenu;
