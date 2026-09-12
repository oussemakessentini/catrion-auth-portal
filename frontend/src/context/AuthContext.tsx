import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import axiosClient from "../api/axiosClient";
import type { AuthResponse, User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  hasRole: (role: string) => boolean;
  logout: () => Promise<void>;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser
      ? (JSON.parse(savedUser) as User)
      : null;
  });
  const hasRole = (role: string) => {
    return user?.roles.includes(role) ?? false;
    };
  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const data = response.data;

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    const loggedUser: User = {
    email: data.email,
    fullName: data.fullName,
    roles: data.roles,
    };

    localStorage.setItem("user", JSON.stringify(loggedUser));
    setUser(loggedUser);

    return data;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>(
      "/auth/register",
      {
        fullName,
        email,
        password,
      }
    );

    return response.data;
  };

  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch {
      // Clear local session even if backend logout fails.
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}