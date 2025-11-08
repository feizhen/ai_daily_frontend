import React from 'react';
import UserMenu from '../../../components/UserMenu';
import styles from './Header.module.less';

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <div className={styles.greeting}>
        <h1>Hello 👋</h1>
        <p>Welcome to today's AI Daily</p>
      </div>
      {/* 用户头像暂时屏蔽 */}
      {/* <div className={styles.userMenu}>
        <UserMenu />
      </div> */}
    </div>
  );
};

export default Header;