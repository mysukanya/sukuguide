import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, handle: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const DEFAULT_GUEST_PROFILE: Profile = {
  id: 'guest-usr-001',
  email: 'suku.sec@workstation.local',
  handle: 'suku_sec',
  fullName: 'Sukanya (Security Researcher)',
  terminalTheme: 'matrix-emerald',
  bio: 'Specializing in Network Packet Analysis, Linux Kernel exploitation, and Web Application Security.',
  createdAt: '2025-09-01T08:00:00Z'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check local storage for guest session or retrieve Supabase session
    const savedGuest = localStorage.getItem('sukuguide_guest_auth');
    if (savedGuest === 'true') {
      const savedProfile = localStorage.getItem('sukuguide_profile');
      setIsGuest(true);
      setUser({ id: DEFAULT_GUEST_PROFILE.id, email: DEFAULT_GUEST_PROFILE.email });
      setProfile(savedProfile ? JSON.parse(savedProfile) : DEFAULT_GUEST_PROFILE);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      // Default to guest session automatically if Supabase is unconfigured, for instantaneous review
      setIsGuest(true);
      setUser({ id: DEFAULT_GUEST_PROFILE.id, email: DEFAULT_GUEST_PROFILE.email });
      setProfile(DEFAULT_GUEST_PROFILE);
      setLoading(false);
      return;
    }

    // Supabase Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsGuest(false);
        setUser({ id: session.user.id, email: session.user.email || '' });
        fetchProfile(session.user.id, session.user.email || '');
      } else if (!isGuest) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile:', error);
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          handle: data.handle,
          fullName: data.full_name || '',
          terminalTheme: data.terminal_theme || 'matrix-emerald',
          bio: data.bio || '',
          createdAt: data.created_at
        });
      } else {
        // Fallback default profile
        const newProf: Profile = {
          id: userId,
          email,
          handle: email.split('@')[0],
          fullName: '',
          terminalTheme: 'matrix-emerald',
          createdAt: new Date().toISOString()
        };
        setProfile(newProf);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase credentials are not configured in .env. Use "Launch Terminal Demo Session" below.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    setIsGuest(false);
    localStorage.removeItem('sukuguide_guest_auth');
    return {};
  };

  const signUp = async (email: string, password: string, handle: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured yet. You can explore immediately via Demo Mode.' };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          handle,
          full_name: fullName
        }
      }
    });
    if (error) {
      return { error: error.message };
    }
    if (data.user) {
      setIsGuest(false);
      localStorage.removeItem('sukuguide_guest_auth');
    }
    return {};
  };

  const enterDemoMode = () => {
    setIsGuest(true);
    localStorage.setItem('sukuguide_guest_auth', 'true');
    setUser({ id: DEFAULT_GUEST_PROFILE.id, email: DEFAULT_GUEST_PROFILE.email });
    setProfile(DEFAULT_GUEST_PROFILE);
    setLoading(false);
  };

  const signOut = async () => {
    if (isGuest) {
      setIsGuest(false);
      localStorage.removeItem('sukuguide_guest_auth');
      setUser(null);
      setProfile(null);
    } else {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem('sukuguide_profile', JSON.stringify(updated));

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase
        .from('profiles')
        .update({
          handle: updated.handle,
          full_name: updated.fullName,
          terminal_theme: updated.terminalTheme,
          bio: updated.bio
        })
        .eq('id', user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
