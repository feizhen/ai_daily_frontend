import React from 'react';
import styles from './Filters.module.less';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { FilterType } from '../index';

interface FiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const Filters: React.FC<FiltersProps> = ({ activeFilter, onFilterChange }) => {
  const { t } = useLanguage();
  const filters: FilterType[] = ['All', 'video', 'news'];

  const getFilterLabel = (filter: FilterType): string => {
    switch (filter) {
      case 'All':
        return t('filter.all');
      case 'video':
        return t('filter.video');
      case 'news':
        return t('filter.news');
      default:
        return filter;
    }
  };

  return (
    <div className={styles.filters}>
      {filters.map((filter) => (
        <button
          key={filter}
          className={activeFilter === filter ? styles.active : ''}
          onClick={() => onFilterChange(filter)}
        >
          {getFilterLabel(filter)}
        </button>
      ))}
    </div>
  );
};

export default Filters;