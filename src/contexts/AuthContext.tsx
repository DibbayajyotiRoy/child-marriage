"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, LoginRequest } from "@/api/services/auth.service";
import { personService } from "@/api/services/person.service";
import type { Person } from "@/types";

// The User interface now directly extends the updated Person type
export interface User extends Person {}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse stored user from localStorage:", error);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    // Super Admin login
    if (
      credentials.email === "admin@system.com" &&
      credentials.password === "password"
    ) {
      const superAdminUser: User = {
        id: "00000000-0000-0000-0000-000000000001",
        firstName: "Super",
        lastName: "Admin",
        email: "admin@system.com",
        role: "SUPERADMIN",
        address: "Agartala",
        gender: "Other",
        phoneNumber: "1111111111",
      };
      localStorage.setItem("user", JSON.stringify(superAdminUser));
      setUser(superAdminUser);
      return true;
    }

    // SDM login
    if (
      credentials.email === "sdm@system.com" &&
      credentials.password === "password"
    ) {
      const sdmUser: User = {
        id: "00000000-0000-0000-0000-000000000002",
        firstName: "SDM",
        lastName: "User",
        email: "sdm@system.com",
        role: "SDM",
        address: "Udaipur",
        gender: "Other",
        phoneNumber: "2222222222",
      };
      localStorage.setItem("user", JSON.stringify(sdmUser));
      setUser(sdmUser);
      return true;
    }

    // --- NEW: Add DM Login ---
    if (
      credentials.email === "dm@system.com" &&
      credentials.password === "password"
    ) {
      const dmUser: User = {
        id: "00000000-0000-0000-0000-000000000003",
        firstName: "DM",
        lastName: "User",
        email: "dm@system.com",
        role: "DM",
        address: "Dharmanagar",
        gender: "Other",
        phoneNumber: "3333333333",
      };
      localStorage.setItem("user", JSON.stringify(dmUser));
      setUser(dmUser);
      return true;
    }

    // --- NEW: Add SP Login ---
    if (
      credentials.email === "sp@system.com" &&
      credentials.password === "password"
    ) {
      const spUser: User = {
        id: "00000000-0000-0000-0000-000000000004",
        firstName: "SP",
        lastName: "User",
        email: "sp@system.com",
        role: "SP",
        address: "Sadar",
        gender: "Other",
        phoneNumber: "4444444444",
      };
      localStorage.setItem("user", JSON.stringify(spUser));
      setUser(spUser);
      return true;
    }

    // Fallback to real API login for other users
    try {
      const response = await authService.login(credentials);
      if (response && response.userId) {
        const userData = (await personService.getById(response.userId)) as User;
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return true;
      } else {
        throw new Error(
          response.message || "Login failed: Invalid response from server."
        );
      }
    } catch (error) {
      console.error("API login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
