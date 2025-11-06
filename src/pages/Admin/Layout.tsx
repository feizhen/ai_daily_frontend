import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import styles from './Layout.module.less';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={styles.adminLayout}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>AI Daily Admin</h1>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.userInfo}>
            👤 {user?.nickname || user?.email}
          </span>
          <Button variant="outline" onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className={styles.mainContainer}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <NavLink
              to="/admin/videos"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.icon}>📹</span>
              <span>视频管理</span>
            </NavLink>
            <NavLink
              to="/admin/news"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.icon}>📰</span>
              <span>新闻管理</span>
            </NavLink>
          </nav>

          <div className={styles.sidebarFooter}>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full"
            >
              ← 返回首页
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
