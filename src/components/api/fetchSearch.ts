import { Product } from '../types/productsTypes';

function fakeSkuFromId(id: number): string {
  return `SKU-${id}`;
}

async function fetchAllSearchProducts(query: string): Promise<Product[]> {
  const limit = 100;
  let allProducts: Product[] = [];
  const encodedQuery = encodeURIComponent(query.trim());
  
  while (true) {
    const url = `https://dummyjson.com/products/search?q=${encodedQuery}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Ошибка загрузки товаров');
    
    if (!Array.isArray(data.products) || typeof data.total !== 'number') {
      throw new Error('Некорректный формат данных от сервера');
    }
    
    const fetchedProducts = data.products.map((p: Product) => ({
      ...p,
      sku: p.sku || fakeSkuFromId(p.id),
    }));
    allProducts = [...allProducts, ...fetchedProducts];
    if (allProducts.length >= data.total) break;
  }
  
  const lowerQuery = query.trim().toLowerCase();
  return allProducts.filter((p) => p.title.toLowerCase().includes(lowerQuery));
}

export default fetchAllSearchProducts;