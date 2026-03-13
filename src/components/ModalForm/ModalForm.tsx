import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './ModalForm.module.css';
import { Product } from '../types/productsTypes';

type ModalFormProps = {
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'> & { id: number }) => void;
};

const ModalForm: React.FC<ModalFormProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [rating, setRating] = useState('');
  const [price, setPrice] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Название обязательно';
    if (!brand.trim()) errs.brand = 'Бренд обязателен';
    if (!sku.trim()) errs.sku = 'Артикул обязателен';

    if (!price.trim()) {
      errs.price = 'Цена обязательна';
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      errs.price = 'Цена должна быть неотрицательным числом';
    }

    if (stock && !/^\d+$/.test(stock)) errs.stock = 'Количество должно быть положительным числом';

    if (rating) {
      const r = Number(rating);
      if (isNaN(r) || r < 0 || r > 5) errs.rating = 'Оценка должна быть от 0 до 5';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newProduct: Omit<Product, 'id'> & { id: number } = {
      id: Date.now(),
      title: title.trim(),
      brand: brand.trim(),
      sku: sku.trim(),
      stock: stock ? Number(stock) : 0,
      rating: rating ? Number(rating) : 0,
      price: Number(price),
    };

    onSubmit(newProduct);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const backgroundRef = useRef<HTMLDivElement>(null);

  const onBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === backgroundRef.current) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      className={styles.modalBackground}
      ref={backgroundRef}
      onClick={onBackgroundClick}
      role="dialog"
      aria-modal="true"
    >
      <form className={styles.modalContent} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.modalTitle}>Добавить новый товар</h2>

        <label htmlFor="title" className={styles.label}>
          Название *
          <input
            id="title"
            ref={titleInputRef}
            type="text"
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
            aria-describedby="error-title"
            required
            maxLength={100}
          />
          {errors.title && <span id="error-title" className={styles.error}>{errors.title}</span>}
        </label>

        <label htmlFor="brand" className={styles.label}>
          Бренд *
          <input
            id="brand"
            type="text"
            className={`${styles.input} ${errors.brand ? styles.inputError : ''}`}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            aria-invalid={!!errors.brand}
            aria-describedby="error-brand"
            required
            maxLength={50}
          />
          {errors.brand && <span id="error-brand" className={styles.error}>{errors.brand}</span>}
        </label>

        <label htmlFor="sku" className={styles.label}>
          Артикул *
          <input
            id="sku"
            type="text"
            className={`${styles.input} ${errors.sku ? styles.inputError : ''}`}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            aria-invalid={!!errors.sku}
            aria-describedby="error-sku"
            required
            maxLength={50}
          />
          {errors.sku && <span id="error-sku" className={styles.error}>{errors.sku}</span>}
        </label>

        <label htmlFor="price" className={styles.label}>
          Цена *
          <input
            id="price"
            type="number"
            className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-invalid={!!errors.price}
            aria-describedby="error-price"
            min={0}
            step={0.01}
            placeholder="0.00"
            required
          />
          {errors.price && <span id="error-price" className={styles.error}>{errors.price}</span>}
        </label>

        <label htmlFor="stock" className={styles.label}>
          Количество
          <input
            id="stock"
            type="number"
            className={`${styles.input} ${errors.stock ? styles.inputError : ''}`}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            aria-invalid={!!errors.stock}
            aria-describedby="error-stock"
            min={0}
            step={1}
            placeholder="0"
          />
          {errors.stock && <span id="error-stock" className={styles.error}>{errors.stock}</span>}
        </label>

        <label htmlFor="rating" className={styles.label}>
          Рейтинг (0-5)
          <input
            id="rating"
            type="number"
            className={`${styles.input} ${errors.rating ? styles.inputError : ''}`}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            aria-invalid={!!errors.rating}
            aria-describedby="error-rating"
            min={0}
            max={5}
            step={0.1}
            placeholder="–"
          />
          {errors.rating && <span id="error-rating" className={styles.error}>{errors.rating}</span>}
        </label>

        <div className={styles.buttons}>
          <button type="button" onClick={onClose} className={styles.buttonCancel}>
            Отмена
          </button>
          <button type="submit" className={styles.buttonSubmit}>
            Добавить
          </button>
        </div>
      </form>
    </div>,
    document.getElementById('modal-root')!
  );
};

export default ModalForm;