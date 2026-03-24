'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type User = {
  id: string;
  nickname: string;
  email: string;
  isBanned: boolean;
  isVerified: boolean;
  role: 'admin' | 'user';
  createdAt: string;
  themePalette?: 'vibe' | 'ocean' | 'sunset' | 'forest';
  uiStyle?: 'glass' | 'neomorph' | 'skeuomorph' | 'minimal';
  statusText?: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Sync theme
  useEffect(() => {
    if (user) {
      document.documentElement.setAttribute('data-theme', user.themePalette || 'vibe');
      document.documentElement.setAttribute('data-style', user.uiStyle || 'glass');
    } else {
      document.documentElement.setAttribute('data-theme', 'vibe');
      document.documentElement.setAttribute('data-style', 'glass');
    }
  }, [user]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return (
    <UserContext.Provider value={{ user, loading, checkAuth, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
