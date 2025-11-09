import React from 'react';
import styles from './Filters.module.less';
import type { FilterType } from '../index';

interface FiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const Filters: React.FC<FiltersProps> = ({ activeFilter, onFilterChange }) => {
  const filters: FilterType[] = ['All', 'video', 'news'];

  return (
    <div className={styles.filters}>
      {filters.map((filter) => (
        <button
          key={filter}
          className={activeFilter === filter ? styles.active : ''}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default Filters;