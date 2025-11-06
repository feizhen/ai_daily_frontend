import React from 'react';
import styles from './Toolbar.module.less';

const Toolbar: React.FC = () => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.datePicker}>
        <button>&lt;</button>
        <span>2025/11/02</span>
        <button>&gt;</button>
      </div>
      <div className={styles.itemCount}>
        <span>15</span>
      </div>
    </div>
  );
};

export default Toolbar;