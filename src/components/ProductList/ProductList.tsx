import React, { useEffect, useState } from 'react';
import styles from './ProductList.module.css';
import Pagination from '../Pagination/Pagination';
import ModalForm from '../ModalForm/ModalForm';
import Toasts from '../Toasts/toasts';
import { Product, SortState } from '../types/productsTypes';
import { useSorting } from '../hooks/useSorting';
import { usePagination } from '../hooks/usePagination';
import { useFetchProducts } from '../hooks/useFetchProducts'; 
import { sortProducts } from '../../utils/sortProducts';

const ProductList: React.FC = () => {
  const itemsPerPage = 10; 
  const { products, total, fetchPageProductsHook, fetchAllSearchProductsHook } = useFetchProducts();
  const { sort, setSort } = useSorting() as unknown as {
    sort: SortState;
    setSort: React.Dispatch<React.SetStateAction<SortState>>;
  };
  const { page, totalPages, onPageClick, setPage } = usePagination(total);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  useEffect(() => {
    setPage(1);
  }, [search, setPage]);

  useEffect(() => {
    const trimmedSearch = search.trim();
    if (trimmedSearch.length > 0) {
      fetchAllSearchProductsHook(trimmedSearch);
    } else {
      fetchPageProductsHook(page);
    }
  }, [page, search, fetchPageProductsHook, fetchAllSearchProductsHook]);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const handleAddProduct = (product: Omit<Product, 'id'> & { id: number }) => {
    addToast(`Товар "${product.title}" успешно добавлен!`);
  };

  const onRefresh = () => {
    const trimmedSearch = search.trim();
    if (trimmedSearch.length > 0) {
      fetchAllSearchProductsHook(trimmedSearch);
    } else {
      fetchPageProductsHook(page);
    }
  };

  const onFilter = () => {
    setSearch('');
    setPage(1);
  };

  const onToggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  const onToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const sortedProducts = sortProducts(products, sort);

  const paginatedProducts = sortedProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

const maxStock = Math.max(...paginatedProducts.map((p) => p.stock ?? 0), 1);

  return (
    <div className={styles.productListContainer}>
      <header className={styles.headerBar}>
        <h1 className={styles.headerTitle}>Товары</h1>

        <div className={styles.headerSearchWrapper}>
          <input
            type="search"
            placeholder="Найти"
            aria-label="Поиск товаров"
            className={styles.headerSearchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          <span className={styles.headerSearchIcon}>&#128269;</span>
        </div>

        <div className={styles.headerRightIcons}>
          <span className={styles.headerIconBadge} data-count="1" aria-label="Выбор языка">🌐</span>
          <div className={styles.headerRightDivider} />
          <span className={styles.headerIconBadge} data-count="12" aria-label="Уведомления">🔔</span>
          <span aria-label="Сообщения" style={{ cursor: 'pointer' }}>✉️</span>
          <span aria-label="Фильтры" style={{ cursor: 'pointer' }}>⚙️</span>
        </div>
      </header>

      <div className={styles.subHeader}>
        <span>Все позиции</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            aria-label="Обновить"
            className={styles.buttonRefresh}
            type="button"
            onClick={onRefresh}
          >
            &#8635;
          </button>
          <button
            aria-label="Фильтр"
            className={styles.buttonFilter}
            type="button"
            onClick={onFilter}
          >
            &#x2630;
          </button>
          <button
            title="Добавить товар"
            className={styles.buttonAdd}
            onClick={() => setIsAddOpen(true)}
            type="button"
          >
             <span>Добавить</span>
          </button>
        </div>
      </div>

      <table className={styles.productTable}>
        <thead>
          <tr>
            <th className={styles.checkboxColumn}>
              <input
                type="checkbox"
                aria-label="Выбрать все"
                checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0}
                onChange={onToggleSelectAll}
              />
            </th>
            <th className={styles.nameColumn}>Наименование</th>
            <th className={styles.vendorColumn}>Вендор</th>
            <th className={styles.skuColumn}>Артикул</th>
            <th className={styles.ratingColumn}>Оценка</th>
            <th className={styles.priceColumn}>Цена, ₽</th>
            <th className={styles.stockColumn}>Количество</th>
            <th className={styles.actionsColumn} />
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center' }}>
                Товары не найдены
              </td>
            </tr>
          ) : (
            paginatedProducts.map((product, index) => {
              const categories = [
                'Аксессуары',
                'Бытовая техника',
                'Телефоны',
                'Игровые приставки',
                'Электроника',
              ];
              const category = product.category ?? categories[index % categories.length];
              const ratingRaw = product.rating ?? 3 + (index % 10) * 0.1;
              const rating = ratingRaw.toFixed(1);
              const lowRating = ratingRaw < 3;
              const isSelected = selectedIds.includes(product.id);
              const isRowActive = index === 3;
              return (
                <tr
                  key={product.id}
                  className={`${styles.productRow} ${
                    isRowActive ? styles.selectedRow : ''
                  }`}
                  aria-selected={isSelected}
                >
                  <td className={styles.checkboxColumn}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.id)}
                      aria-label={`Выбрать товар ${product.title}`}
                    />
                  </td>
                  <td className={styles.nameColumn}>
                    <div>
                      <a href="#" className="title-link" style={{ fontWeight: 600, color: '#333' }}>
                        {product.title}
                      </a>
                      <small style={{ color: '#666', fontWeight: 400 }}>{category}</small>
                    </div>
                  </td>
                  <td className={styles.vendorColumn}>
                    <strong>{product.brand}</strong>
                  </td>
                  <td className={styles.skuColumn}>{product.sku}</td>
                  <td className={`${styles.ratingColumn} ${lowRating ? styles.low : ''}`}>
                    {rating}/5
                  </td>
                  <td className={styles.priceColumn}>
                    {product.price != null ? formatPrice(product.price) : '-'}
                  </td>
                 <td className={styles.stockColumn}>
                  <div className={styles.progressBarCell}>
                    <div
                      className={styles.progressBarCellFill}
                      style={{ width: `${((product.stock ?? 0) / maxStock) * 100}%` }}
                    />
                  </div>
                  </td>
                  <td className={styles.actionsColumn}>
                    <button
                      type="button"
                      className={styles.actionBtnPlus}
                      aria-label={`Добавить товар ${product.title}`}
                      onClick={() => addToast(`Товар "${product.title}" добавлен`)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtnMore}
                      aria-label={`Меню действий для товара ${product.title}`}
                    >
                      &#8943;
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Пагинация c текстом слева, кнопками справа */}
      <div className={styles.paginationBlock}>
        {!search.trim() && (
          <div className={styles.paginationInfo}>
            Показано <strong>{(page - 1) * itemsPerPage + 1}</strong> -{' '}
            <strong>{Math.min(page * itemsPerPage, total)}</strong> из <strong>{total}</strong>
          </div>
      )}
        <div className={styles.paginationNavigation}>
          {!search.trim() && totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalItems={total}
              itemsPerPage={itemsPerPage}
              onPageClick={onPageClick}
            />
          )}
        </div>
      </div>

      {isAddOpen && (
        <ModalForm
          onClose={() => setIsAddOpen(false)}
          onSubmit={(product) => {
            handleAddProduct(product);
            setIsAddOpen(false);
          }}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
};

export default ProductList;