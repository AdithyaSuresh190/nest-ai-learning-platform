import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { supabase } from '@/services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const roleAvatars: Record<UserRole, string> = {
  student: '🧒',
  teacher: '👩‍🏫',
  parent: '👨',
  therapist: '👩‍⚕️',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    const authUser = session.user;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (profile) {
      setUser({
        id: profile.id,
        name: profile.name,
        email: authUser.email || '',
        role: profile.role as UserRole,
        avatar: profile.avatar || roleAvatars[profile.role as UserRole] || '🧒',
        gradeLevel: profile.grade_level || undefined,
        linkedStudents: profile.linked_students || undefined,
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      fetchProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      fetchProfile(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    await fetchProfile(data.session);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    if (!data.user) {
      return { success: false, error: 'Could not create account.' };
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      role,
      avatar: roleAvatars[role],
      grade_level: role === 'student' ? 'Grade 3' : null,
      linked_students: role === 'parent' || role === 'therapist' ? [] : null,
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    await fetchProfile(data.session);
    return { success: true };
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
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
