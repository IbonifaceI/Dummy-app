import React from 'react';
import { Toast, ToastsProps } from '../types/types';
import styles from './toasts.module.css';




const Toasts: React.FC<ToastsProps> = ({ toasts }) => {
  return (
    <div className={styles.toastsContainer}>
      {toasts.map(({ id, message }) => (
        <div key={id} className={styles.toast} role="alert" aria-live="assertive">
          {message}
        </div>
      ))}
    </div>
  );
};

export default Toasts;