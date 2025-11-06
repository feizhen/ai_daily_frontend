import React from 'react';
import styles from './Header.module.less';

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <div className={styles.greeting}>
        <h1>Hello 👋</h1>
        <p>Let's continue. Today's progress <span>40%</span></p>
      </div>
    </div>
  );
};

export default Header;