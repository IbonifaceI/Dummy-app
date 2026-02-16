import React, { useState, useEffect } from 'react';
import {
  validateProductName,
  validatePrice,
  validateVendor,
  validateSKU,
} from '../../utils/validation';
import styles from './AddProductModal.module.css';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: {
    title: string;
    price: number;
    brand: string;
    sku: string;
    rating: number;
    stock: number;
  }) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [rating, setRating] = useState('4.0');
  const [stock, setStock] = useState('10');

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setPrice('');
      setBrand('');
      setSku('');
      setRating('4.0');
      setStock('10');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string | null } = {};
    errs.title = validateProductName(title);
    errs.price = validatePrice(Number(price));
    errs.brand = validateVendor(brand);
    errs.sku = validateSKU(sku);
    setErrors(errs);
    return Object.values(errs).every(e => !e);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAdd({
      title,
      price: Number(price),
      brand,
      sku,
      rating: Number(rating),
      stock: Number(stock),
    });
  };

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <form className={styles.modal} onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
        <h3 className={styles.heading}>Добавить товар</h3>

        <label className={styles.label}>
          Наименование
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={styles.input}
            autoFocus
          />
          {errors.title && <div className={styles.error}>{errors.title}</div>}
        </label>

        <label className={styles.label}>
          Цена, ₽
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className={styles.input}
            min={0}
            step={0.01}
          />
          {errors.price && <div className={styles.error}>{errors.price}</div>}
        </label>

        <label className={styles.label}>
          Вендор
          <input
            type="text"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            className={styles.input}
          />
          {errors.brand && <div className={styles.error}>{errors.brand}</div>}
        </label>

        <label className={styles.label}>
          Артикул
          <input
            type="text"
            value={sku}
            onChange={e => setSku(e.target.value)}
            className={styles.input}
          />
          {errors.sku && <div className={styles.error}>{errors.sku}</div>}
        </label>

        <label className={styles.label}>
          Рейтинг
          <input
            type="number"
            value={rating}
            onChange={e => setRating(e.target.value)}
            className={styles.input}
            min={0}
            max={5}
            step={0.01}
          />
        </label>

        <label className={styles.label}>
          Количество
          <input
            type="number"
            value={stock}
            onChange={e => setStock(e.target.value)}
            className={styles.input}
            min={0}
            step={1}
          />
        </label>

        <div className={styles.btnGroup}>
          <button type="button" onClick={onClose} className={styles.buttonCancel}>
            Отмена
          </button>
          <button type="submit" className={styles.buttonAdd}>
            Добавить
          </button>
        </div>
      </form>
    </div>
  );
};