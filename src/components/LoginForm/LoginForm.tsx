import React, { useState } from "react";
import styles from './LoginForm.module.css';
import { useAuth } from "../context/AuthContext";
import { LoginFormProps } from "../types/loginTypes";

type MessageType = { type: "error" | "success"; message: string } | null;

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState<MessageType>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!form.username || !form.password) {
      setMessage({ type: "error", message: "Пожалуйста, заполните все поля" });
      return;
    }
    try {
      await login(form.username, form.password, rememberMe);
      setMessage({ type: "success", message: "Успешная авторизация!" });
      setTimeout(() => {
        setMessage(null);
        onLoginSuccess();
      }, 800);
    } catch (err: any) {
      setMessage({ type: "error", message: err.message || "Ошибка при авторизации" });
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.formContainer} onSubmit={handleSubmit} noValidate>
        <div className={styles.logo} />
        <h1 className={styles.title}>Добро пожаловать!</h1>
        <p className={styles.subtitle}>Пожалуйста, авторизуйтесь</p>

        {message && (
          <div className={message.type === "error" ? styles.error : styles.success}>
            {message.message}
          </div>
        )}

        <label htmlFor="username" className={styles.label}>Логин</label>
        <input
          id="username"
          type="text"
          className={styles.input}
          value={form.username}
          onChange={handleChange}
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
          value={form.password}
          onChange={handleChange}
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
            onChange={(e) => setRememberMe(e.target.checked)}
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
          {loading ? "Вход..." : "Войти"}
        </button>

        <p className={styles.registerText}>
          Нет аккаунта?{" "}
          <a href="#" className={styles.registerLink} onClick={(e) => e.preventDefault()}>
            Создать
          </a>
        </p>
      </form>
    </div>
  );
};