import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/productsTypes';

function fakeSkuFromId(id: number): string {
  return `SKU-${id}`;
}

interface UseFetchProductsParams {
  page: number;
  itemsPerPage: number;
  search?: string;
}

interface UseFetchProductsResult {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function useFetchProducts({
  page,
  itemsPerPage,
  search = '',
}: UseFetchProductsParams): UseFetchProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLimit = 100;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (search.trim()) {
        const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(
          search.trim()
        )}&limit=100`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Ошибка загрузки товаров');

        const mapped = data.products.map((p: Product) => ({
          ...p,
          sku: p.sku || fakeSkuFromId(p.id),
        }));

        setProducts(mapped);
        setTotal(data.total || mapped.length);
      } else {
        const skip = (page - 1) * itemsPerPage;

        if (itemsPerPage <= maxLimit) {
          const url = `https://dummyjson.com/products?limit=${itemsPerPage}&skip=${skip}`;
          const res = await fetch(url);
          const data = await res.json();

          if (!res.ok) throw new Error(data.message || 'Ошибка загрузки товаров');

          setProducts(
            data.products.map((p: Product) => ({
              ...p,
              sku: p.sku || fakeSkuFromId(p.id),
            }))
          );
          setTotal(data.total);
        } else {
          // Разбиваем на два запрос
          const firstLimit = maxLimit - (skip % maxLimit);
          const secondLimit = itemsPerPage - firstLimit;

          const url1 = `https://dummyjson.com/products?limit=${firstLimit}&skip=${skip}`;
          const res1 = await fetch(url1);
          const data1 = await res1.json();
          if (!res1.ok) throw new Error(data1.message || 'Ошибка загрузки товаров');

          const url2 = `https://dummyjson.com/products?limit=${secondLimit}&skip=${skip + firstLimit}`;
          const res2 = await fetch(url2);
          const data2 = await res2.json();
          if (!res2.ok) throw new Error(data2.message || 'Ошибка загрузки товаров');

          const combined = [...data1.products, ...data2.products].map((p: Product) => ({
            ...p,
            sku: p.sku || fakeSkuFromId(p.id),
          }));

          setProducts(combined);
          setTotal(data1.total);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, total, loading, error };
}