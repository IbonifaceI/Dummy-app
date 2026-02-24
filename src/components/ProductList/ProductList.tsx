import React, { useEffect, useState, useMemo } from "react";
import styles from "./ProductList.module.css";
import { useAuth } from "../context/AuthContext";

interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  rating: number;
  stock: number;
  sku?: string;
}

type SortOrder = "asc" | "desc" | null;

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

const SORT_STORAGE_KEY = "productlist_sortstate";
const ITEMS_PER_PAGE = 20;

function fakeSkuFromId(id: number): string {
  return "SKU" + id.toString().padStart(5, "0");
}

const getInitialSort = (): SortState => {
  try {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    if (!saved) return { column: null, order: null };
    const parsed: SortState = JSON.parse(saved);

    const validColumns = [
      "title",
      "brand",
      "sku",
      "rating",
      "price",
      "stock",
      null,
    ];
    const validOrders = ["asc", "desc", null];

    if (
      validColumns.includes(parsed.column) &&
      validOrders.includes(parsed.order)
    ) {
      return parsed;
    }
  } catch {
  }
  return { column: null, order: null };
};

interface Toast {
  id: number;
  message: string;
}

export const ProductList: React.FC = () => {
  const { logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [sort, setSort] = useState<SortState>(getInitialSort);

  // Toast уведомления
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Модалка добавления товара
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    brand: "",
    sku: "",
  });

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sort));
  }, [sort]);

  const fetchPageProducts = async (pageNum: number) => {
    setLoading(true);
    try {
      const skip = (pageNum - 1) * ITEMS_PER_PAGE;
      const url = `https://dummyjson.com/products?limit=${ITEMS_PER_PAGE}&skip=${skip}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка загрузки товаров");

      const prodsWithSku: Product[] = data.products.map((p: Product) => ({
        ...p,
        sku: p.sku || fakeSkuFromId(p.id),
      }));
      setProducts(prodsWithSku);
      setTotal(data.total);
    } catch (e: any) {
      console.error("Ошибка загрузки", e.message);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSearchProducts = async (query: string) => {
    setLoading(true);
    try {
      let allProducts: Product[] = [];
      const limit = 100;
      let skip = 0;

      while (true) {
        const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(
          query,
        )}&limit=${limit}&skip=${skip}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Ошибка загрузки товаров");

        const fetchedProducts = (data.products as Product[]).map((p) => ({
          ...p,
          sku: p.sku || fakeSkuFromId(p.id),
        }));

        allProducts = [...allProducts, ...fetchedProducts];

        if (allProducts.length >= data.total) {
          break;
        }
        skip += limit;
      }

      const lowerQuery = query.trim().toLowerCase();
      allProducts = allProducts.filter((p) =>
        p.title.toLowerCase().includes(lowerQuery),
      );

      setProducts(allProducts);
      setTotal(allProducts.length);
    } catch (e: any) {
      console.error("Ошибка поисковой загрузки", e.message);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search.trim()) {
      fetchAllSearchProducts(search.trim());
      setPage(1);
    } else {
      fetchPageProducts(page);
    }
  }, [search, page]);

  const sortedProducts = useMemo(() => {
    if (!sort.column || !sort.order) return products;

    const column = sort.column;

    return [...products].sort((a, b) => {
      let aValue: string | number | undefined = a[column];
      let bValue: string | number | undefined = b[column];

      if (aValue === undefined) aValue = "";
      if (bValue === undefined) bValue = "";

      if (
        typeof aValue === "string" &&
        !["sku", "title", "brand"].includes(column)
      ) {
        const parsedA = Number(aValue);
        aValue = isNaN(parsedA) ? aValue : parsedA;
      }
      if (
        typeof bValue === "string" &&
        !["sku", "title", "brand"].includes(column)
      ) {
        const parsedB = Number(bValue);
        bValue = isNaN(parsedB) ? bValue : parsedB;
      }

      if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
      if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
      return 0;
    });
  }, [products, sort]);

  const renderSortIndicator = (col: keyof ProductSortable) => {
    if (sort.column !== col) return null;
    if (sort.order === "asc") return <span className={styles.sortIndicator}>▲</span>;
    if (sort.order === "desc") return <span className={styles.sortIndicator}>▼</span>;
    return null;
  };

  const handleSort = (column: keyof ProductSortable) => {
    if (sort.column === column) {
      if (sort.order === "asc") {
        setSort({ column, order: "desc" });
      } else if (sort.order === "desc") {
        setSort({ column: null, order: null });
      }
    } else {
      setSort({ column, order: "asc" });
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Toast helper
  const addToast = (message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3000);
  };

  // Обработка добавления товара
  const onAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newProduct.title.trim() ||
      !newProduct.price.trim() ||
      !newProduct.brand.trim() ||
      !newProduct.sku.trim()
    ) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    addToast(`Товар "${newProduct.title}" успешно добавлен!`);
    setIsAddOpen(false);
    setNewProduct({ title: "", price: "", brand: "", sku: "" });
  };

  const onPageClick = (p: number) => {
    if (p !== page && p >= 1 && p <= totalPages) {
      setPage(p);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(
        <button
          key={p}
          type="button"
          onClick={() => onPageClick(p)}
          className={`${styles.pageButton} ${p === page ? styles.activePage : ""}`}
          aria-current={p === page ? "page" : undefined}
          aria-label={`Перейти на страницу ${p}`}
        >
          {p}
        </button>,
      );
    }
    return pages;
  };

  return (
    <div className={styles.wrapper} style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
  
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
        <button
          onClick={() => logout()}
          style={{
            padding: "8px 16px",
            marginTop: 10,
            cursor: "pointer",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
          }}
          aria-label="Выйти из аккаунта"
          title="Выйти"
          type="button"
        >
          Выйти
        </button>
      </div>

      {/* Прогресс бар с отведенным местом */}
      <div style={{ height: 5, marginBottom: 20 }}>
        {loading && (
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} />
          </div>
        )}
      </div>

      {/* Заголовок + поиск + кнопка добавить */}
      <div className={styles.header}>
        <h2 className={styles.title}>Товары</h2>

        <input
          type="search"
          placeholder="Найти"
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Поиск товаров"
          autoComplete="off"
        />

        <div className={styles.buttons}>
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

      {/* Таблица */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort("title")} role="button" tabIndex={0}>
                Наименование {renderSortIndicator("title")}
              </th>
              <th onClick={() => handleSort("brand")} role="button" tabIndex={0}>
                Вендор {renderSortIndicator("brand")}
              </th>
              <th onClick={() => handleSort("sku")} role="button" tabIndex={0}>
                Артикул {renderSortIndicator("sku")}
              </th>
              <th onClick={() => handleSort("rating")} role="button" tabIndex={0}>
                Качество {renderSortIndicator("rating")}
              </th>
              <th onClick={() => handleSort("price")} role="button" tabIndex={0}>
                Цена, ₽ {renderSortIndicator("price")}
              </th>
              <th onClick={() => handleSort("stock")} role="button" tabIndex={0}>
                Количество {renderSortIndicator("stock")}
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {!loading && sortedProducts.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#888" }}>
                  Товары не найдены
                </td>
              </tr>
            )}

            {sortedProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>{product.brand}</td>
                <td>{product.sku}</td>
                <td>
                  <span className={`${styles.rating} ${product.rating < 3 ? styles.low : ""}`}>
                    {product.rating.toFixed(2)}
                  </span>
                </td>
                <td className={styles.price}>{product.price.toLocaleString("ru-RU")} ₽</td>
                <td className={styles.quantity}>{product.stock}</td>
                <td>
                  <button
                    style={{
                      backgroundColor: "#0055ff",
                      border: "none",
                      borderRadius: 8,
                      color: "white",
                      cursor: "pointer",
                      padding: "4px 8px",
                      fontWeight: 600,
                      marginRight: 8,
                    }}
                    onClick={() => addToast(`Товар "${product.title}" добавлен в корзину!`)}
                    title="Добавить товар в корзину"
                    type="button"
                  >
                    +
                  </button>
                  <button
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 20,
                      padding: "4px 8px",
                      color: "#555",
                      fontWeight: "bold",
                    }}
                    aria-label="Открыть меню действий"
                    title="Дополнительные действия"
                    onClick={() => alert(`Открыть меню действий для "${product.title}"`)}
                    type="button"
                  >
                    ⋯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {!search.trim() && totalPages > 1 && (
        <div
          className={styles.paginationWrapper}
          aria-label="Пагинация товаров"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}
        >
          <div className={styles.paginationInfo} style={{ color: "#666", fontSize: 14 }}>
            Показано {Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-
            {Math.min(page * ITEMS_PER_PAGE, total)} из {total}
          </div>
          <nav className={styles.paginationNav} aria-label="Навигация по страницам">
            <button
              type="button"
              onClick={() => onPageClick(page - 1)}
              disabled={page === 1}
              aria-label="Предыдущая страница"
              className={styles.pageButton}
              style={{ marginRight: 8 }}
            >
              &lt;
            </button>
            {renderPageNumbers()}
            <button
              type="button"
              onClick={() => onPageClick(page + 1)}
              disabled={page === totalPages}
              aria-label="Следующая страница"
              className={styles.pageButton}
              style={{ marginLeft: 8 }}
            >
              &gt;
            </button>
          </nav>
        </div>
      )}

      {/* Модалка добавления товара */}
      {isAddOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="add-product-title" tabIndex={-1}>
          <div className={styles.modal}>
            <h3 id="add-product-title">Добавить товар</h3>
            <form onSubmit={onAddSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="prod-title">Наименование</label>
                <input
                  id="prod-title"
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="prod-price">Цена</label>
                <input
                  id="prod-price"
                  type="number"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="prod-brand">Вендор</label>
                <input
                  id="prod-brand"
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="prod-sku">Артикул</label>
                <input
                  id="prod-sku"
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  required
                />
              </div>
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.modalButtonPrimary}>Добавить</button>
                <button type="button" className={styles.modalButtonSecondary} onClick={() => setIsAddOpen(false)}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast уведомления */}
      <div className={styles.toastContainer} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};