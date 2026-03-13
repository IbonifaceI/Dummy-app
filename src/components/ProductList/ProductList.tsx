
import React, { useEffect, useState } from 'react';
import styles from './ProductList.module.css';
import Pagination from '../Pagination/Pagination';
import ModalForm from '../ModalForm/ModalForm';
import Toasts from '../toasts';
import { useFetchProducts, useSorting } from '../../utils/hooks';
import { Product } from '../types/productsTypes';
import { sortProducts } from '../../utils/sortProducts';

const ITEMS_PER_PAGE = 10;

const ProductList: React.FC = () => {
  const { products, total, fetchPageProductsHook, fetchAllSearchProductsHook } = useFetchProducts();
  const [sort, setSort] = useSorting(); // Получаем состояние сортировки

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
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

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    addToast(`Товар "${product.title}" успешно добавлен!`);
  };

  const toggleSelect = (sku: string) => {
    setSelectedIds((prev) =>
      selectedIds.includes(sku) ? prev.filter((item) => item !== sku) : [...prev, sku],
    );
  };

  const isSelected = (sku: string) => selectedIds.includes(sku);

  const onRefresh = () => {
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      fetchAllSearchProductsHook(trimmedSearch);
    } else {
      fetchPageProductsHook(page);
    }
  };

  const onFilter = () => {
    setSearch('');
    setPage(1);
  };

  const sortedProducts = sortProducts(products, sort);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const productsOnPage = sortedProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const renderTableRows = () =>
    productsOnPage.map((product) => (
      <tr
        key={product.sku}
        className={`${styles.productRow} ${isSelected(product.sku) && styles.selectedRow}`}
        onClick={() => toggleSelect(product.sku)}
      >
        <td className={styles.checkboxColumn}>
          <input type="checkbox" checked={isSelected(product.sku)} readOnly />
        </td>
        <td className={styles.nameColumn}>
          <span className={styles.title}>{product.title}</span>
          <br />
          <small>{product.category}</small>
        </td>
        <td className={styles.vendorColumn}>{product.brand ?? '-'}</td>
        <td className={styles.skuColumn}>{product.sku}</td>
        <td className={`${styles.ratingColumn} ${product.rating != null && product.rating <= 3 ? styles.low : ''}`}>
          {(product.rating != null ? product.rating.toFixed(1) : '-') + '/5'}
        </td>
        <td className={styles.priceColumn}>
          {product.price
            ?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
            ?? '-'}
        </td>
        <td className={styles.quantityColumn}>{product.stock ?? 0}</td>
        <td className={styles.actionsColumn}>
  <button type="button" className={styles.actionBtnPlus}>
    +
  </button>
  <button type="button" className={styles.actionBtnMore}> 
    ...
  </button>
</td>
      </tr>
    ));

  return (
    <div className={styles.productListContainer}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h2 className={styles.pageTitle}>Товары</h2>
        </div>
        <div className={styles.topBarCenter}>
          <div className={styles.searchWrapper}>
            <input
              type="search"
              placeholder="Найти"
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Поиск товаров"
              autoComplete="off"
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </div>
        <div className={styles.topBarRight}>
          <button
            aria-label="Обновить"
            className={styles.actionButton}
            onClick={onRefresh}
            type="button"
          >
            🗘
          </button>
          <button
            aria-label="Фильтр"
            className={styles.actionButton}
            onClick={onFilter}
            type="button"
          >
            ☰
          </button>
          <button
            title="Добавить товар"
            className={styles.buttonAdd}
            onClick={() => setIsAddOpen(true)}
            type="button"
          >
            Добавить
          </button>
        </div>
      </div>

      <div className={styles.subHeader}>
        <span className={styles.subHeaderTitle}>Все позиции</span>
      </div>

      <table className={styles.productTable}>
        <thead>
          <tr>
            <th></th>
            <th
              onClick={() => setSort({ field: 'title', order: sort.order === 'asc' ? 'desc' : 'asc' })}
            >
              Наименование
            </th>
            <th
              onClick={() => setSort({ field: 'brand', order: sort.order === 'asc' ? 'desc' : 'asc' })}
            >
              Вендор
            </th>
            <th
              onClick={() => setSort({ field: 'article', order: sort.order === 'asc' ? 'desc' : 'asc' })}
            >
              Артикул
            </th>
            <th
              onClick={() => setSort({ field: 'rating', order: sort.order === 'asc' ? 'desc' : 'asc' })}
            >
              Оценка
            </th>
            <th
              onClick={() => setSort({ field: 'price', order: sort.order === 'asc' ? 'desc' : 'asc' })}
            >
              Цена,₽
            </th>
            <th
              onClick={() => setSort({ field: 'stock', order: sort.order === 'asc' ? 'desc' : 'asc' })}
            >
              Кол-во
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>

      {!search.trim() && totalPages > 1 && (
        <div className={styles.paginationBlock}>
          <Pagination currentPage={page} totalPages={totalPages} onPageClick={setPage} />
        </div>
      )}

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