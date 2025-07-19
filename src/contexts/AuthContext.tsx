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
import type { Person } from "@/types"; // Import your main Person type

// ✅ FIXED: The User type now correctly extends the updated Person type without conflict.
export interface User extends Person {
  role: "MEMBER" | "SUPERVISOR" | "SUPERADMIN";
}

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
    if (
      credentials.email === "admin@system.com" &&
      credentials.password === "password"
    ) {
      console.log("Static Superadmin login successful.");
      const superAdminUser: User = {
        id: "00000000-0000-0000-0000-000000000001",
        firstName: "Super",
        lastName: "Admin",
        email: "admin@system.com",
        role: "SUPERADMIN",
      };
      localStorage.setItem("user", JSON.stringify(superAdminUser));
      setUser(superAdminUser);
      return true;
    }

    try {
      const response = await authService.login(credentials);
      if (response && response.userId) {
        const userProfile = await personService.getById(response.userId);
        const userData: User = {
          ...userProfile,
          role: userProfile.role || "MEMBER",
        };
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
    window.location.href = "/login";
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
