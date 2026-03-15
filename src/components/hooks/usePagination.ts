import { useState } from 'react';

const ITEMS_PER_PAGE = 20;

export const usePagination = (totalItems: number, itemsPerPage = 10) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const onPageClick = (p: number) => {
    if (p !== page && p >= 1 && p <= totalPages) {
      setPage(p);
    }
  };

  return { page, totalPages, onPageClick, setPage };
};