import React, { createContext, useContext, useState, useEffect } from 'react';
import { personService, adminService } from '@/api';

export type UserRole = 'superadmin' | 'person' | 'police' | 'dise' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes - will be replaced with API calls
const MOCK_USERS: User[] = [
  { id: '1', name: 'Super Admin', email: 'admin@system.com', role: 'superadmin' },
  { id: '2', name: 'John Doe', email: 'john@tech.com', role: 'person', departmentId: '1', departmentName: 'Technical' },
  { id: '3', name: 'Officer Smith', email: 'smith@police.com', role: 'police' },
  { id: '4', name: 'Agent Johnson', email: 'johnson@dise.com', role: 'dise' },
  { id: '5', name: 'Manager Wilson', email: 'wilson@admin.com', role: 'admin' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('authToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try admin login first
      if (email.includes('admin')) {
        const response = await adminService.login({ email, password });
        const userData: User = {
          id: response.admin.id,
          name: response.admin.name,
          email: response.admin.email,
          role: response.admin.role,
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', response.token);
        return true;
      }

      // Try person login
      const response = await personService.login({ email, password });
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        departmentId: response.user.departmentId,
        departmentName: response.user.departmentName,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', response.token);
      return true;
    } catch (error) {
      // Fallback to mock authentication for demo
      console.warn('API login failed, using mock authentication:', error);
      const foundUser = MOCK_USERS.find(u => u.email === email);
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        localStorage.setItem('authToken', 'mock-token');
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
