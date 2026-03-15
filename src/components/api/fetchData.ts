import { Product } from '../types/productsTypes';

const ITEMS_PER_PAGE = 194; 

function fakeSkuFromId(id: number): string {
  return `SKU-${id}`;
}

async function fetchPageProducts(pageNum: number): Promise<Product[]> {
  const limit = ITEMS_PER_PAGE;

  const url = `https://dummyjson.com/products?limit=${limit}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Ошибка загрузки товаров');

  if (!Array.isArray(data.products))
    throw new Error('Некорректный формат данных от сервера');

  return data.products.map((p: Product) => ({
    ...p,
    sku: p.sku || fakeSkuFromId(p.id),
  }));
}

export default fetchPageProducts;