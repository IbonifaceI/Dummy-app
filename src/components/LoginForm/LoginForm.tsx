import React, { useState, FormEvent } from 'react';
import styles from './LoginForm.module.css';

const API_AUTH_URL = 'https://dummyjson.com/auth/login';

interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
  refreshToken: string;
}

function validateEmail(email: string): string | null {
  if (!email) return 'Email обязателен';
  const re = /\S+@\S+\.\S+/;
  if (!re.test(email)) return 'Введите корректный email';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Пароль обязателен';
  if (password.length < 3) return 'Пароль должен быть минимум 3 символа';
  return null;
}

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    const eErr = validateEmail(email);
    if (eErr) {
      setError(eErr);
      return false;
    }
    const pErr = validatePassword(password);
    if (pErr) {
      setError(pErr);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });
      const json: AuthResponse & { message?: string } = await res.json();

      if (res.ok && json.token) {
        if (rememberMe) {
          localStorage.setItem('authToken', json.token);
        } else {
          sessionStorage.setItem('authToken', json.token);
        }
        alert(`Добро пожаловать, ${json.firstName} ${json.lastName}!`);
        window.location.reload();
      } else {
        setError(json.message || 'Ошибка авторизации');
      }
    } catch {
      setError('Ошибка сети. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.formContainer} noValidate>
        <div className={styles.logo} aria-label="лого сайта" />
        <h2 className={styles.title}>Добро пожаловать!</h2>
        <p className={styles.subtitle}>Пожалуйста, авторизуйтесь</p>

        <label htmlFor="email" className={styles.label}>
          Почта
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={styles.input}
          autoComplete="username"
          disabled={loading}
          required
        />

        <label htmlFor="password" className={styles.label}>
          Пароль
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={styles.input}
          autoComplete="current-password"
          disabled={loading}
          required
        />

        <div className={styles.checkboxGroup}>
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="remember" className={styles.checkboxLabel}>
            Запомнить данные
          </label>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          className={loading ? styles.buttonDisabled : styles.button}
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <p className={styles.registerText}>
          Нет аккаунта?{' '}
          <a href="#" className={styles.registerLink}>
            Создать
          </a>
        </p>
      </form>
    </div>
  );
};