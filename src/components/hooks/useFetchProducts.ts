import { useCallback, useState } from 'react';
import { Product } from '../types/productsTypes';
import fetchPageProducts from '../api/fetchData';
import fetchAllSearchProducts from '../api/fetchSearch';

export function useFetchProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchPageProductsHook = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const prods = await fetchPageProducts(pageNum);
      setProducts(prods);
      if ('total' in prods && typeof (prods as any).total === 'number') {
        setTotal((prods as any).total);
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