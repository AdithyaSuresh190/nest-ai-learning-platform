import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { supabase } from '@/services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User | null }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string; user?: User | null }>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
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

  const fetchProfile = async (session: Session | null): Promise<User | null> => {
    if (!session?.user) {
      setUser(null);
      setIsLoading(false);
      return null;
    }
    const authUser = session.user;

    // Wait a moment for the session to be fully established after signUp
    // (Supabase can return a session before the auth record is fully committed)
    let profile: Record<string, unknown> | null = null;
    let profileError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      profile = result.data;
      profileError = result.error;
      if (profile || !result.error) break;
      await new Promise((r) => setTimeout(r, 300));
    }

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      setUser(null);
      setIsLoading(false);
      return null;
    }

    if (profile) {
      const u: User = {
        id: profile.id as string,
        name: profile.name as string,
        email: authUser.email || '',
        role: profile.role as UserRole,
        avatar: (profile.avatar as string) || roleAvatars[profile.role as UserRole] || '🧒',
        avatarUrl: (profile.avatar_url as string) || undefined,
        bio: (profile.bio as string) || undefined,
        dateOfBirth: (profile.date_of_birth as string) || undefined,
        phone: (profile.phone as string) || undefined,
        address: (profile.address as string) || undefined,
        gradeLevel: (profile.grade_level as string) || undefined,
        linkedStudents: (profile.linked_students as string[]) || undefined,
      };
      setUser(u);
      setIsLoading(false);
      return u;
    } else {
      setUser(null);
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      fetchProfile(session);
    });

    // onAuthStateChange callback runs synchronously — wrap async work in IIFE to avoid deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      (async () => {
        await fetchProfile(session);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    const u = await fetchProfile(data.session);
    if (!u) {
      return { success: false, error: 'Could not load your profile. Please try again.' };
    }
    return { success: true, user: u };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string; user?: User | null }> => {
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

    // Insert the profile row — the RLS policy requires auth.uid() = id,
    // which is satisfied because the session is established after signUp
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      role,
      avatar: roleAvatars[role],
      grade_level: role === 'student' ? 'Grade 3' : null,
      linked_students: role === 'parent' || role === 'therapist' ? [] : null,
    });

    if (profileError) {
      // If the profile insert fails (e.g. duplicate), try upsert as a fallback
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        role,
        avatar: roleAvatars[role],
        grade_level: role === 'student' ? 'Grade 3' : null,
        linked_students: role === 'parent' || role === 'therapist' ? [] : null,
      });
      if (upsertError) {
        return { success: false, error: upsertError.message };
      }
    }

    // Fetch the profile to set the user state
    let u = await fetchProfile(data.session);
    if (!u) {
      // Session might be null if email confirmation is required — try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        return { success: false, error: 'Account created but could not sign in automatically. Please log in manually.' };
      }
      u = await fetchProfile(signInData.session);
      if (!u) {
        return { success: false, error: 'Account created but profile could not be loaded. Please log in manually.' };
      }
    }
    return { success: true, user: u };
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetchProfile(session);
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not signed in' };

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth || null;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    setUser({ ...user, ...updates });
    return { success: true };
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
