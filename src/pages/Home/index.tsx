import React, { useState } from 'react';
import styles from './style.module.less';
import Header from './components/Header.tsx';
import Filters from './components/Filters.tsx';
import Toolbar from './components/Toolbar.tsx';
import Recommendation from './components/Recommendation.tsx';

export type FilterType = 'All' | 'video' | 'news';

const Home: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  return (
    <div className={styles.homePage}>
      <Header />
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <Filters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <Toolbar />
        </div>
        <Recommendation activeFilter={activeFilter} />
      </div>
    </div>
  );
};

export default Home;
