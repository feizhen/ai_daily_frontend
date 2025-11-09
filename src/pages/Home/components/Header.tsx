import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import UserMenu from '../../../components/UserMenu';
import styles from './Header.module.less';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <div className={styles.header}>
      <div className={styles.greeting}>
        <h1>
          {isAuthenticated && user?.nickname
            ? `${t('header.greeting')}, ${user.nickname} 👋`
            : `${t('header.greeting')} 👋`}
        </h1>
        <p>{t('header.welcome')}</p>
      </div>
      <div className={styles.userMenu}>
        <UserMenu />
      </div>
    </div>
  );
};

export default Header;