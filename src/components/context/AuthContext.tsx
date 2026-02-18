import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  username: string;
  token: string;
  // Можно добавить другие поля пользователя
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

const STORAGE_KEY = "dummyjson_token";

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Восстановление сессии при монтировании
  useEffect(() => {
    const token =
      sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (token) {
      // Можно попробовать в реальном API проверить токен,
      // но DummyJSON — для примера
      setUser({
        id: -1,
        username: "user",
        token,
      });
    }
    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string,
    remember: boolean
  ) => {
    // Пример вызова API DummyJSON Auth: https://dummyjson.com/docs/auth
    const url = "https://dummyjson.com/auth/login";
    const body = {
      username,
      password,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка авторизации");
    }

    const data = await response.json();

    // Сохраняем токен
    if (remember) {
      localStorage.setItem(STORAGE_KEY, data.token);
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, data.token);
      localStorage.removeItem(STORAGE_KEY);
    }

    setUser({
      id: data.id,
      username: data.username,
      token: data.token,
    });
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};