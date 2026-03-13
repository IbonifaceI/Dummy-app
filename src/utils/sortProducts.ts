// sortProducts.ts

import { Product, SortState } from '../components/types/productsTypes';

export function sortProducts(products: Product[], sort: SortState): Product[] {
  if (!sort.field || !sort.order) return products;

  const { field, order } = sort;

  const stringColumns = ['article', 'title', 'brand']; 

  return [...products].sort((a, b) => {
    let aValue = (a as any)[field];
    let bValue = (b as any)[field];

    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';

    if (typeof aValue === 'string' && !stringColumns.includes(field)) {
      const parsedA = Number(aValue);
      aValue = isNaN(parsedA) ? aValue : parsedA;
    }
    if (typeof bValue === 'string' && !stringColumns.includes(field)) {
      const parsedB = Number(bValue);
      bValue = isNaN(parsedB) ? bValue : parsedB;
    }

    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    return 0;
  });
}