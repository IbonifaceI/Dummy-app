export interface Product {
  id: number;
  sku: string;
  title: string;
  brand?: string | null;
  rating?: number | null;
  price?: number | null;
  stock?: number | null;
  category?: string;
}

export type SortField = 'title' | 'brand' | 'article' | 'rating' | 'price' | 'stock';

export type SortOrder = 'asc' | 'desc' | null;

export interface SortState {
  field: SortField;
  order: 'asc' | 'desc';
}


export type ProductSortable = {
  title: string;
  brand: string;
  sku: string;
  rating: number;
  price: number;
  stock: number;
};

export const SORT_STORAGE_KEY = 'productlist_sortstate';
export const ITEMS_PER_PAGE = 20;

export interface Toast {
  id: number;
  message: string;
}