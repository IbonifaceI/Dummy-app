import React, { useEffect, useState, useMemo } from "react";
import styles from "./ProductList.module.css";

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

const ITEMS_PER_PAGE = 10;

function fakeSkuFromId(id: number): string {
  return "SKU" + id.toString().padStart(5, "0");
}

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ column: null, order: null });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const url = search.trim()
          ? `https://dummyjson.com/products/search?q=${encodeURIComponent(
              search
            )}&limit=${ITEMS_PER_PAGE}&skip=${skip}`
          : `https://dummyjson.com/products?limit=${ITEMS_PER_PAGE}&skip=${skip}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Ошибка загрузки товаров");

        const prodsWithSku = data.products.map((p: Product) => ({
          ...p,
          sku: p.sku || fakeSkuFromId(p.id),
        }));

        setProducts(prodsWithSku);
      } catch (e: any) {
        console.error("Ошибка загрузки", e.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, search]);

  const handleSort = (column: keyof ProductSortable) => {
    if (sort.column === column) {
      // переключаем порядок asc -> desc -> none
      if (sort.order === "asc") {
        setSort({ column, order: "desc" });
      } else if (sort.order === "desc") {
        setSort({ column: null, order: null });
      }
    } else {
      setSort({ column, order: "asc" });
    }
  };

  const sortedProducts = useMemo(() => {
    if (!sort.column || !sort.order) return products;

    return [...products].sort((a, b) => {
      let aValue: any = a[sort.column!];
      let bValue: any = b[sort.column!];

      // При необходимости кастим в число
      if (
        typeof aValue === "string" &&
        !["sku", "title", "brand"].includes(sort.column!)
      ) {
        aValue = Number(aValue);
      }
      if (
        typeof bValue === "string" &&
        !["sku", "title", "brand"].includes(sort.column!)
      ) {
        bValue = Number(bValue);
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
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          aria-label="Поиск товаров"
        />

        <div className={styles.buttons}>
          <button
            title="Добавить товар"
            className={styles.buttonAdd}
            onClick={() => alert("Открыть форму добавления товара")}
          >
            Добавить
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input type="checkbox" className={styles.checkbox} aria-label="Выбрать все" />
              </th>
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
                <td colSpan={8} style={{ textAlign: "center", padding: 20, color: "#888" }}>
                  Товары не найдены
                </td>
              </tr>
            )}

            {sortedProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    aria-label={`Выбрать товар ${product.title}`}
                  />
                </td>
                <td>{product.title}</td>
                <td>{product.brand}</td>
                <td>{product.sku}</td>
                <td>
                  <span className={`${styles.rating} ${product.rating < 3 ? styles.low : ""}`}>
                    {product.rating.toFixed(2)}
                  </span>
                </td>
                <td className={styles.price}>{product.price.toLocaleString()} ₽</td>
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
                    onClick={() => alert(`Добавить товар ${product.title} в корзину`)}
                    title="Добавить товар"
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
                  >
                    ⋯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Убираем пагинацию во время поиска */}
      {!search.trim() && (
        <div className={styles.pagination}>
          {Array.from({ length: 10 }).map((_, i) => (
            <button
              key={i}
              className={`${styles.pageButton} ${page === i + 1 ? styles.active : ""}`}
              onClick={() => setPage(i + 1)}
              aria-label={`Перейти на страницу ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};