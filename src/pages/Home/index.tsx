import React, { useState } from 'react';
import styles from './style.module.less';
import Header from './components/Header.tsx';
import Filters from './components/Filters.tsx';
import Toolbar from './components/Toolbar.tsx';
import Recommendation from './components/Recommendation.tsx';

export type FilterType = 'All' | 'video' | 'news' | 'favorites';

const Home: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [isFavoritesMode, setIsFavoritesMode] = useState(false);

  const handleFilterChange = (filter: FilterType) => {
    // 在收藏模式下，点击 All/video/news 只是过滤收藏类型，不退出收藏模式
    // 只有点击收藏按钮才能切换收藏模式
    setActiveFilter(filter);
  };

  const handleFavoritesToggle = () => {
    if (isFavoritesMode) {
      // 退出收藏模式
      setIsFavoritesMode(false);
      setActiveFilter('All');
    } else {
      // 进入收藏模式
      setIsFavoritesMode(true);
      setActiveFilter('All'); // 默认显示所有收藏
    }
  };

  return (
    <div className={styles.homePage}>
      <Header />
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <Filters activeFilter={activeFilter} onFilterChange={handleFilterChange} />
          <Toolbar
            isFavoritesMode={isFavoritesMode}
            onFavoritesToggle={handleFavoritesToggle}
          />
        </div>
        <Recommendation activeFilter={activeFilter} isFavoritesMode={isFavoritesMode} />
      </div>
    </div>
  );
};

export default Home;
