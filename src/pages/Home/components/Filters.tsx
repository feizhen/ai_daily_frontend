import React from 'react';
import styles from './Filters.module.less';

const Filters: React.FC = () => {
  return (
    <div className={styles.filters}>
      <button className={styles.active}>All</button>
      <button>video</button>
      <button>news</button>
      <button>Tools</button>
    </div>
  );
};

export default Filters;