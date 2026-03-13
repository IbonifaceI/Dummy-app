import { Product } from '../components/types/productsTypes';

type SortState = {
  column: keyof Product | null;
  order: 'asc' | 'desc' | null;
};

const SORT_STORAGE_KEY = 'productSort';

export function fakeSkuFromId(id: number): string {
  return `SKU${id.toString().padStart(5, '0')}`;
}

export function getInitialSort(): SortState {
  try {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    if (!saved) return { column: null, order: null };
    const parsed: SortState = JSON.parse(saved);
    const validColumns: Array<keyof Product | null> = ['title', 'brand', 'sku', 'rating', 'price', 'stock', null];
    const validOrders: Array<'asc' | 'desc' | null> = ['asc', 'desc', null];
    if (validColumns.includes(parsed.column) && validOrders.includes(parsed.order)) {
      return parsed;
    }
  } catch {
  }
  return { column: null, order: null };
}

export function sortProducts(products: Product[], sort: SortState): Product[] {
  if (!sort.column || !sort.order) return products;
  const column = sort.column;
  const stringColumns = ['sku', 'title', 'brand'];
  return [...products].sort((a, b) => {
    const aRaw = a[column];
    const bRaw = b[column];
    let aValue: string | number = aRaw === undefined || aRaw === null ? '' : (aRaw as string | number);
    let bValue: string | number = bRaw === undefined || bRaw === null ? '' : (bRaw as string | number);

    if (typeof aValue === 'string' && !stringColumns.includes(column)) {
      const parsedA = Number(aValue);
      aValue = isNaN(parsedA) ? aValue : parsedA;
    }
    if (typeof bValue === 'string' && !stringColumns.includes(column)) {
      const parsedB = Number(bValue);
      bValue = isNaN(parsedB) ? bValue : parsedB;
    }
    if (aValue > bValue) return sort.order === 'asc' ? 1 : -1;
    if (aValue < bValue) return sort.order === 'asc' ? -1 : 1;
    return 0;
  });
}