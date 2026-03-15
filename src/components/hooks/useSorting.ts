import { useState } from 'react';
import { SortState, SortField } from '../types/productsTypes';

export function useSorting(): [SortState, React.Dispatch<React.SetStateAction<SortState>>] {
  const initialSortState: SortState = {
    field: 'title' as SortField,
    order: 'asc'
  };
  const [sort, setSort] = useState<SortState>(initialSortState);

  return [sort, setSort];
}