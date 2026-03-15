export interface Product {
  title: string;
  price: number;
  brand: string;
  sku: string;
  rating: number;
  stock: number;
}

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
}

export interface Toast {
  id: number;
  message: string;
}

export interface ToastsProps {
  toasts: Toast[];
}