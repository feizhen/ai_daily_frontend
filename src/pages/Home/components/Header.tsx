import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import UserMenu from '../../../components/UserMenu';
import styles from './Header.module.less';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className={styles.header}>
      <div className={styles.greeting}>
        <h1>
          {isAuthenticated && user?.nickname
            ? `Hello, ${user.nickname} 👋`
            : 'Hello 👋'}
        </h1>
        <p>Welcome to today's AI Daily</p>
      </div>
      <div className={styles.userMenu}>
        <UserMenu />
      </div>
    </div>
  );
};

export default Header;