import { useCallback, useState } from 'react';
import { Product, SortState, SortField } from '../components/types/productsTypes';
import fetchPageProducts from '../components/Fetch/fetchData';
import fetchAllSearchProducts from '../components/Fetch/fetchSearch';

const ITEMS_PER_PAGE = 100;

export function useFetchProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchPageProductsHook = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const prods = await fetchPageProducts(pageNum);
      setProducts(prods);
      if ('totalCount' in prods && typeof (prods as any).totalCount === 'number') {
        setTotal((prods as any).totalCount);
      } else {
        setTotal(prods.length);
      }
    } catch (e: any) {
      console.error('Ошибка загрузки:', e.message);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllSearchProductsHook = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const searchedProds = await fetchAllSearchProducts(query);
      setProducts(searchedProds);
      setTotal(searchedProds.length);
    } catch (e: any) {
      console.error('Ошибка загрузке результатов поиска:', e.message);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, total, fetchPageProductsHook, fetchAllSearchProductsHook };
}

export function useSorting(): [SortState, React.Dispatch<React.SetStateAction<SortState>>] {
  const initialSortState: SortState = {
    field: 'title' as SortField,
    order: 'asc'
  };

  const [sort, setSort] = useState<SortState>(initialSortState);

  return [sort, setSort];
}

function usePagination(total: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const onPageClick = (p: number) => {
    if (p !== page && p >= 1 && p <= totalPages) {
      setPage(p);
    }
  };

  return { page, totalPages, onPageClick, setPage };
}

export { usePagination };