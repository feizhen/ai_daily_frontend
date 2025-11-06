import React from 'react';
import styles from './style.module.less';
import Header from './components/Header.tsx';
import Filters from './components/Filters.tsx';
import Toolbar from './components/Toolbar.tsx';
import Recommendation from './components/Recommendation.tsx';

const Home: React.FC = () => {
  return (
    <div className={styles.homePage}>
      <Header />
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <Filters />
          <Toolbar />
        </div>
        <Recommendation />
      </div>
    </div>
  );
};

export default Home;
