'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/chat';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser, restoreSession, logout as logoutAction } from '@/store/slices/authSlice';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, token, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  const login = useCallback(
    async (phone: string, name: string) => {
      await dispatch(loginUser({ phone, name })).unwrap();
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    router.push('/');
    setTimeout(() => {
      dispatch(logoutAction());
    }, 300);
  }, [dispatch, router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
