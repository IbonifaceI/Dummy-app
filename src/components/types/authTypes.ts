import { ReactNode } from "react";

export interface User {
  id: number;
  username: string;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}