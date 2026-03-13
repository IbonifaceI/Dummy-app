import React, { useState, useEffect } from 'react';
import {
  validateProductName,
  validatePrice,
  validateVendor,
  validateSKU,
} from '../../utils/validation';
import styles from './AddProductModal.module.css';
import { AddProductModalProps, Product } from '../types/types';

type FormFields = keyof Product;

const initialFormState: Product = {
  title: '',
  price: 0,
  brand: '',
  sku: '',
  rating: 4.0,
  stock: 10,
};

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [form, setForm] = useState<Product>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<FormFields, string | null>>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validators: Record<FormFields, (value: any) => string | null> = {
    title: validateProductName,
    price: (val: number) => validatePrice(val),
    brand: validateVendor,
    sku: validateSKU,
    rating: () => null, 
    stock: () => null, 
  };

  const inputsConfig: {
    name: FormFields;
    label: string;
    type: string;
    min?: number;
    max?: number;
    step?: number;
    autoFocus?: boolean;
  }[] = [
    { name: 'title', label: 'Наименование', type: 'text', autoFocus: true },
    { name: 'price', label: 'Цена, ₽', type: 'number', min: 0, step: 0.01 },
    { name: 'brand', label: 'Вендор', type: 'text' },
    { name: 'sku', label: 'Артикул', type: 'text' },
    { name: 'rating', label: 'Рейтинг', type: 'number', min: 0, max: 5, step: 0.01 },
    { name: 'stock', label: 'Количество', type: 'number', min: 0, step: 1 },
  ];

  const validate = () => {
    const newErrors: Partial<Record<FormFields, string | null>> = {};
    (Object.keys(validators) as FormFields[]).forEach((field) => {
      newErrors[field] = validators[field](form[field]);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleChange = (field: FormFields, value: string) => {
    let parsedValue: any = value;
    if (field === 'price' || field === 'rating' || field === 'stock') {
      parsedValue = field === 'stock' ? parseInt(value, 10) || 0 : parseFloat(value) || 0;
    }
    setForm((prev) => ({
      ...prev,
      [field]: parsedValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAdd(form);
  };

  return (
    <div
      className={styles.backdrop}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <form
        className={styles.modal}
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
      >
        <h3 className={styles.heading}>Добавить товар</h3>
        {inputsConfig.map(({ name, label, type, min, max, step, autoFocus }) => (
          <label className={styles.label} key={name}>
            {label}
            <input
              type={type}
              value={form[name]}
              onChange={e => handleChange(name, e.target.value)}
              className={styles.input}
              min={min}
              max={max}
              step={step}
              autoFocus={autoFocus}
            />
            {errors[name] && <div className={styles.error}>{errors[name]}</div>}
          </label>
        ))}
        <div className={styles.btnGroup}>
          <button
            type="button"
            onClick={onClose}
            className={styles.buttonCancel}
          >
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