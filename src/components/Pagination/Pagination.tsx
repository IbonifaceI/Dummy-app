import React from 'react';
import styles from './TablePagination.module.css';

type Props = {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageClick: (pageNumber: number) => void;
};

const Pagination: React.FC<Props> = ({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageClick,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages === 0) return null;

  const renderPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(
        <button
          key={p}
          type="button"
          onClick={() => onPageClick(p)}
          className={`${styles['pagination-button']} ${currentPage === p ? styles['active-page'] : ''}`}
          aria-current={currentPage === p ? 'page' : undefined}
          aria-label={`Перейти на страницу ${p}`}
          disabled={currentPage === p}
        >
          {p}
        </button>,
      );
    }
    return pages;
  };

  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const toItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={styles['pagination-wrapper']} aria-label="Пагинация товаров">
      <div className={styles['pagination-info']}>
      </div>
      <nav className={styles['pagination-nav']} aria-label="Навигация по страницам">
        <button
          type="button"
          onClick={() => onPageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Предыдущая страница"
          className={styles['pagination-button']}
          style={{ marginRight: 8 }}
        >
          &lt;
        </button>
        {renderPageNumbers()}
        <button
          type="button"
          onClick={() => onPageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Следующая страница"
          className={styles['pagination-button']}
          style={{ marginLeft: 8 }}
        >
          &gt;
        </button>
      </nav>
    </div>
  );
};

export default Pagination;