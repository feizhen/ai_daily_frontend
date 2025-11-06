import React from 'react';
import { Button } from '@/components/ui/button';
import styles from './Toolbar.module.less';

const Toolbar: React.FC = () => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.datePicker}>
        <Button variant="datePicker">&lt;</Button>
        <span>2025/11/02</span>
        <Button variant="datePicker">&gt;</Button>
      </div>
      <div className={styles.itemCount}>
        <span>15</span>
      </div>
    </div>
  );
};

export default Toolbar;