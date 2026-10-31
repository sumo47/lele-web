'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserProfile } from '@/lib/types';
import {
  apiGetMe,
  apiLogin,
  apiGoogleLogin,
  apiSignup,
  apiLogout,
  getStoredToken,
  setStoredToken,
} from '@/lib/api';

import { resolvePartnerStatus } from '@/lib/auth-redirect';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isVendorApproved: boolean;
  isRiderApproved: boolean;
  isShopApproved: boolean;
  isVendorPending: boolean;
  isRiderPending: boolean;
  isShopPending: boolean;
  isVendorRejected: boolean;
  isRiderRejected: boolean;
  isShopRejected: boolean;
  hasPartnerRole: boolean;
  shopId?: string | null;
  login: (credentials: { email: string; password: string }) => Promise<UserProfile | null>;
  loginWithGoogle: (idToken: string) => Promise<UserProfile | null>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
  }) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const profile = await apiGetMe();
      setUser(profile);
      return profile;
    } catch {
      // Token expired or invalid
      setStoredToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      await apiLogin(credentials);
      return await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      await apiGoogleLogin(idToken);
      return await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
  }): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      await apiSignup(data);
      return await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const partnerStatus = resolvePartnerStatus(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isVendorApproved: partnerStatus.isVendorApproved,
        isRiderApproved: partnerStatus.isRiderApproved,
        isShopApproved: partnerStatus.isShopApproved,
        isVendorPending: partnerStatus.isVendorPending,
        isRiderPending: partnerStatus.isRiderPending,
        isShopPending: partnerStatus.isShopPending,
        isVendorRejected: partnerStatus.isVendorRejected,
        isRiderRejected: partnerStatus.isRiderRejected,
        isShopRejected: partnerStatus.isShopRejected,
        hasPartnerRole: partnerStatus.hasPartnerRole,
        shopId: partnerStatus.shopId,
        login,
        loginWithGoogle,
        signup,
        logout,
        refreshUser,
      }}
    >
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
