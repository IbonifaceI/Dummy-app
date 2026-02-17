import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import { useAuth } from '../context/AuthContext';

export const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!username || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      await login(username, password, rememberMe);
      setSuccess('Успешная авторизация!');
      // Очистка полей опционально:
      // setUsername('');
      // setPassword('');
      // Спрятать уведомление через 3 секунды
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Ошибка при авторизации');
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.formContainer} onSubmit={handleSubmit} noValidate>
        <div className={styles.logo} />
        <h1 className={styles.title}>Добро пожаловать!</h1>
        <p className={styles.subtitle}>Пожалуйста, авторизуйтесь</p>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <label htmlFor="username" className={styles.label}>
          Почта
        </label>
        <input
          id="username"
          type="text"
          className={styles.input}
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Введите почту"
          autoComplete="username"
          required
          disabled={loading}
        />

        <label htmlFor="password" className={styles.label} style={{ marginTop: 16 }}>
          Пароль
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Введите пароль"
          autoComplete="current-password"
          required
          disabled={loading}
        />

        <div className={styles.checkboxGroup}>
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="rememberMe" className={styles.checkboxLabel}>
            Запомнить данные
          </label>
        </div>

        <button
          type="submit"
          className={loading ? styles.buttonDisabled : styles.button}
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <p className={styles.registerText}>
          Нет аккаунта?{' '}
          <a href="#" className={styles.registerLink} onClick={e => e.preventDefault()}>
            Создать
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;