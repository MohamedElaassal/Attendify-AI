import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Professor } from '../services/api';

type UserRole = 'admin' | 'professor' | null;

interface AuthContextType {
  user: Professor | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (professor: Professor) => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Professor | null>(null);
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('attendify_user');
    const storedRole = localStorage.getItem('attendify_role') as UserRole;
    
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
  }, []);

  const login = (professor: Professor) => {
    setUser(professor);
    setRole('professor');
    localStorage.setItem('attendify_user', JSON.stringify(professor));
    localStorage.setItem('attendify_role', 'professor');
  };

  const loginAsAdmin = () => {
    setUser(null);
    setRole('admin');
    localStorage.setItem('attendify_role', 'admin');
    localStorage.removeItem('attendify_user');
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('attendify_user');
    localStorage.removeItem('attendify_role');
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated: role !== null,
      login,
      loginAsAdmin,
      logout,
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
