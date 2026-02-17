import React, { useEffect, useState, useMemo } from 'react';
import styles from './ProductList.module.css';

interface Product {
  id: number;
  title: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
  sku?: string;
}

type SortOrder = 'asc' | 'desc' | null;

interface SortState {
  column: keyof ProductSortable | null;
  order: SortOrder;
}

type ProductSortable = {
  title: string;
  brand: string;
  sku: string;
  rating: number;
  price: number;
  stock: number;
};

const ITEMS_PER_PAGE = 10;

function fakeSkuFromId(id: number): string {
  return 'SKU' + id.toString().padStart(5, '0');
}

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ column: null, order: null });
  const [toast, setToast] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    brand: '',
    sku: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const skip = (page - 1) * ITEMS_PER_PAGE;
        let url = `https://dummyjson.com/products?limit=${ITEMS_PER_PAGE}&skip=${skip}`;
        if (search.trim()) {
          url = `https://dummyjson.com/products/search?q=${encodeURIComponent(search)}&limit=${ITEMS_PER_PAGE}&skip=${skip}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Ошибка загрузки товаров');

        const productsWithSku = data.products.map((p: Product) => ({
          ...p,
          sku: p.sku || fakeSkuFromId(p.id),
        }));
        setProducts(productsWithSku);
      } catch (e: any) {
        console.error('Ошибка загрузки', e.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, search]);

  const handleSort = (column: keyof ProductSortable) => {
    if (sort.column === column) {
      if (sort.order === 'asc') {
        setSort({ column, order: 'desc' });
      } else if (sort.order === 'desc') {
        setSort({ column: null, order: null });
      }
    } else {
      setSort({ column, order: 'asc' });
    }
  };

  const sortedProducts = useMemo(() => {
    if (!sort.column || !sort.order) return products;

    return [...products].sort((a, b) => {
      let aValue: any = a[sort.column!];
      let bValue: any = b[sort.column!];

      if (typeof aValue === 'string' && !['sku', 'title', 'brand'].includes(sort.column!)) {
        aValue = Number(aValue);
      }
      if (typeof bValue === 'string' && !['sku', 'title', 'brand'].includes(sort.column!)) {
        bValue = Number(bValue);
      }

      if (aValue > bValue) {
        return sort.order === 'asc' ? 1 : -1;
      }
      if (aValue < bValue) {
        return sort.order === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }, [products, sort]);

  const openAddModal = () => {
    setNewProduct({ title: '', price: '', brand: '', sku: '' });
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const handleNewProductChange = (field: keyof typeof newProduct, value: string) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = () => {
    if (
      !newProduct.title.trim() ||
      !newProduct.price.trim() ||
      !newProduct.brand.trim() ||
      !newProduct.sku.trim() ||
      isNaN(Number(newProduct.price))
    ) {
      alert('Пожалуйста, заполните корректно все поля');
      return;
    }
    setToast(`Товар "${newProduct.title.trim()}" успешно добавлен!`);
    closeAddModal();
    setTimeout(() => setToast(null), 3000);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderSortIndicator = (col: keyof ProductSortable) => {
    if (sort.column !== col) return null;
    if (sort.order === 'asc') return <span className={styles.sortIndicator}>▲</span>;
    if (sort.order === 'desc') return <span className={styles.sortIndicator}>▼</span>;
    return null;
  };

  return (
    <div className={styles.wrapper}>
      {loading && (
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar} />
        </div>
      )}

      <div className={styles.header}>
        <h2 className={styles.title}>Товары</h2>

        <input
          type="search"
          placeholder="Найти"
          className={styles.searchInput}
          value={search}
          onChange={e => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <div className={styles.buttons}>
          <button title="Обновить" className={styles.buttonAdd} onClick={() => setPage(1)}>
            &#x21bb;
          </button>
          <button className={styles.buttonAdd} onClick={openAddModal}>
            Добавить
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input type="checkbox" className={styles.checkbox} />
              </th>
              <th onClick={() => handleSort('title')}>
                Наименование {renderSortIndicator('title')}
              </th>
              <th onClick={() => handleSort('brand')}>
                Вендор {renderSortIndicator('brand')}
              </th>
              <th onClick={() => handleSort('sku')}>
                Артикул {renderSortIndicator('sku')}
              </th>
              <th onClick={() => handleSort('rating')}>
                Оценка {renderSortIndicator('rating')}
              </th>
              <th onClick={() => handleSort('price')}>
                Цена, ₽ {renderSortIndicator('price')}
              </th>
              <th onClick={() => handleSort('stock')}>
                Количество {renderSortIndicator('stock')}
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.length === 0 && !loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 20, color: '#888' }}>
                  Товары не найдены
                </td>
              </tr>
            )}

            {sortedProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <input type="checkbox" className={styles.checkbox} />
                </td>
                <td>{product.title}</td>
                <td>{product.brand}</td>
                <td>{product.sku}</td>
                <td>
                  <span className={`${styles.rating} ${product.rating < 3 ? styles.low : ''}`}>
                    {product.rating.toFixed(2)}
                  </span>
                </td>
                <td className={styles.price}>{product.price.toLocaleString()} ₽</td>
                <td className={styles.quantity}>{product.stock}</td>
                <td>
                  <button
                    style={{
                      backgroundColor: '#0055ff',
                      border: 'none',
                      borderRadius: 8,
                      color: 'white',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontWeight: 600,
                      marginRight: 8,
                    }}
                    onClick={() => alert(`Добавить товар ${product.title} в корзину`)}
                    title="Добавить товар"
                  >
                    +
                  </button>

                  <button
                    style={{
                      backgroundColor: '#ff3b3b',
                      border: 'none',
                      borderRadius: 8,
                      color: 'white',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      if (window.confirm(`Удалить товар "${product.title}"?`)) {
                        setProducts(prev => prev.filter(p => p.id !== product.id));
                      }
                    }}
                    title="Удалить товар"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        {Array.from({ length: 10 }).map((_, i) => (
          <button
            key={i}
            className={`${styles.pageButton} ${page === i + 1 ? styles.active : ''}`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={closeAddModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Добавить товар</h3>

            <label className={styles.modalLabel}>Наименование</label>
            <input
              className={styles.modalInput}
              value={newProduct.title}
              onChange={e => handleNewProductChange('title', e.target.value)}
              type="text"
              autoFocus
            />

            <label className={styles.modalLabel}>Цена</label>
            <input
              className={styles.modalInput}
              value={newProduct.price}
              onChange={e => handleNewProductChange('price', e.target.value)}
              type="number"
              min={0}
            />

            <label className={styles.modalLabel}>Вендор</label>
            <input
              className={styles.modalInput}
              value={newProduct.brand}
              onChange={e => handleNewProductChange('brand', e.target.value)}
              type="text"
            />

            <label className={styles.modalLabel}>Артикул</label>
            <input
              className={styles.modalInput}
              value={newProduct.sku}
              onChange={e => handleNewProductChange('sku', e.target.value)}
              type="text"
            />

            <div className={styles.modalButtons}>
              <button className={`${styles.modalButton} ${styles.cancel}`} onClick={closeAddModal}>
                Отмена
              </button>
              <button className={`${styles.modalButton} ${styles.submit}`} onClick={handleAddProduct}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
};