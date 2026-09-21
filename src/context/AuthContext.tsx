import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { mockUsers } from '@/services/mockData';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'nest-auth-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, _password: string): boolean => {
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    // Allow demo login with any email matching a role pattern
    if (email.includes('@nest.edu')) {
      const newUser: User = {
        id: `demo-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'student',
        avatar: '🧒',
      };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, _password: string, role: UserRole): boolean => {
    const avatars: Record<UserRole, string> = {
      student: '🧒',
      teacher: '👩‍🏫',
      parent: '👨',
      therapist: '👩‍⚕️',
    };
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: avatars[role],
      linkedStudents: role === 'parent' || role === 'therapist' ? ['s1'] : undefined,
      gradeLevel: role === 'student' ? 'Grade 3' : undefined,
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
