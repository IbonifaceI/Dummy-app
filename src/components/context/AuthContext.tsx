import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType, AuthProviderProps } from "../types/authTypes";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

const STORAGE_KEY = "dummyjson_token";

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromStorage = () => {
    const token =
      sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (token) {
      setUser({ id: -1, username: "user", token });
    }
  };

  useEffect(() => {
    loadUserFromStorage();
    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string,
    remember: boolean
  ) => {
    const response = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка авторизации");
    }

    const data = await response.json();

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