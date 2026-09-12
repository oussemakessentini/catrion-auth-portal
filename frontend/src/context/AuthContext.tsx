import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import axiosClient from "../api/axiosClient";
import type {
  AuthResponse,
  User,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken =
        localStorage.getItem("accessToken");

      const refreshToken =
        localStorage.getItem("refreshToken");

      if (!accessToken && !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await axiosClient.get<User>(
            "/user/profile"
          );

        setUser(response.data);

        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );
      } catch {
        localStorage.removeItem(
          "accessToken"
        );
        localStorage.removeItem(
          "refreshToken"
        );
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const response =
      await axiosClient.post<AuthResponse>(
        "/auth/login",
        {
          email,
          password,
        }
      );

    const data = response.data;

    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    localStorage.setItem(
      "refreshToken",
      data.refreshToken
    );

    const loggedUser: User = {
      email: data.email,
      fullName: data.fullName,
      roles: data.roles,
    };

    setUser(loggedUser);

    localStorage.setItem(
      "user",
      JSON.stringify(loggedUser)
    );

    return data;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    const response =
      await axiosClient.post<AuthResponse>(
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
      await axiosClient.post(
        "/auth/logout"
      );
    } catch {
      // Still clear local session
    } finally {
      localStorage.removeItem(
        "accessToken"
      );
      localStorage.removeItem(
        "refreshToken"
      );
      localStorage.removeItem("user");

      setUser(null);
    }
  };

  const hasRole = (role: string) => {
    return (
      user?.roles?.includes(role) ?? false
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}