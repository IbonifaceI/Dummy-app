import React, { useEffect, useState, useCallback } from 'react';
import styles from './ProductList.module.css';

interface Product {
  id: number;
  title: string;
  brand: string;
  sku: string; // здесь будем использовать code из API
  rating: number;
  price: number;
  stock: number;
}

type SortKey = 'title' | 'brand' | 'sku' | 'rating' | 'price' | 'stock';
type SortOrder = 'asc' | 'desc';

const API_PRODUCTS_URL = 'https://dummyjson.com/products';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = search.trim()
        ? `https://dummyjson.com/products/search?q=${encodeURIComponent(search.trim())}`
        : API_PRODUCTS_URL;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Ошибка загрузки товаров');
      const json = await res.json();

      const loadedProducts: Product[] = (json.products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        brand: p.brand,
        sku: p.code || `SKU-${p.id}`, // если sku нет в API, создаём заглушку
        rating: p.rating,
        price: p.price,
        stock: p.stock,
      }));

      setProducts(loadedProducts);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  // Добавление товара (без API, по условию)
  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [{ ...product, id: Date.now() }, ...prev]);
    alert('Товар успешно добавлен!');
    setAddModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Товары</h1>

      <input
        type="search"
        placeholder="Найти товар"
        className={styles.searchInput}
        value={search}
        onChange={e => setSearch(e.target.value)}
        disabled={loading}
      />

      <button className={styles.buttonAdd} onClick={() => setAddModalOpen(true)}>
        Добавить
      </button>

      {loading && <div className={styles.loadingBar}>Загрузка...</div>}

      {error && <div className={styles.error}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <SortableTh label="Наименование" sortKey="title" onSort={onSort} currentKey={sortKey} order={sortOrder} />
            <SortableTh label="Вендор" sortKey="brand" onSort={onSort} currentKey={sortKey} order={sortOrder} />
            <SortableTh label="Артикул" sortKey="sku" onSort={onSort} currentKey={sortKey} order={sortOrder} />
            <SortableTh label="Оценка" sortKey="rating" onSort={onSort} currentKey={sortKey} order={sortOrder} />
            <SortableTh label="Цена, ₽" sortKey="price" onSort={onSort} currentKey={sortKey} order={sortOrder} />
            <SortableTh label="Количество" sortKey="stock" onSort={onSort} currentKey={sortKey} order={sortOrder} />
          </tr>
        </thead>
        <tbody>
          {sortedProducts.length === 0 && !loading && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>
                Товары не найдены
              </td>
            </tr>
          )}
          {sortedProducts.map(product => (
            <tr key={product.id}>
              <td>{product.title}</td>
              <td>{product.brand}</td>
              <td>{product.sku}</td>
              <td style={{ color: product.rating < 3 ? 'red' : undefined }}>{product.rating.toFixed(2)}</td>
              <td>{product.price.toLocaleString('ru-RU')}</td>
              <td>{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAddModalOpen && (
        <AddProductModal onClose={() => setAddModalOpen(false)} onAdd={handleAddProduct} />
      )}
    </div>
  );
};

// Вспомогательный компонент для сортируемой шапки
interface SortableThProps {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  order: SortOrder;
  onSort: (key: SortKey) => void;
}

const SortableTh: React.FC<SortableThProps> = ({ label, sortKey, currentKey, order, onSort }) => {
  const active = currentKey === sortKey;

  return (
    <th
      tabIndex={0}
      role="button"
      aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
      onClick={() => onSort(sortKey)}
      onKeyDown={e => {
        if (e.key === 'Enter') onSort(sortKey);
      }}
      style={{ cursor: 'pointer', userSelect: 'none', padding: '8px 12px' }}
    >
      {label} {active && (order === 'asc' ? '▲' : '▼')}
    </th>
  );
};

// Компонент модального окна добавления товара (по условию без API-сохранения)

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (product: Omit<Product, 'id'>) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !price.trim() || !brand.trim() || !sku.trim()) {
      alert('Все поля обязательны!');
      return;
    }

    if (isNaN(+price) || +price <= 0) {
      alert('Цена должна быть положительным числом');
      return;
    }

    onAdd({
      title: title.trim(),
      price: +price,
      brand: brand.trim(),
      sku: sku.trim(),
      rating: 0,
      stock: 0,
    });

    // Очистка поля по закрытию
    setTitle('');
    setPrice('');
    setBrand('');
    setSku('');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Добавить товар</h2>
        <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
          <label>Наименование</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />

          <label>Цена</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min={0} />

          <label>Вендор</label>
          <input type="text" value={brand} onChange={e => setBrand(e.target.value)} required />

          <label>Артикул</label>
          <input type="text" value={sku} onChange={e => setSku(e.target.value)} required />

          <div className={styles.modalButtons}>
            <button type="button" onClick={onClose}>
              Отмена
            </button>
            <button type="submit">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
};