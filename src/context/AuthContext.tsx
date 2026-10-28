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

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isVendorApproved: boolean;
  isRiderApproved: boolean;
  isVendorPending: boolean;
  isRiderPending: boolean;
  isVendorRejected: boolean;
  isRiderRejected: boolean;
  hasPartnerRole: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await apiGetMe();
      setUser(profile);
    } catch {
      // Token expired or invalid
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      await apiLogin(credentials);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setLoading(true);
    try {
      await apiGoogleLogin(idToken);
      await refreshUser();
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
  }) => {
    setLoading(true);
    try {
      await apiSignup(data);
      await refreshUser();
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

  const roles = Array.isArray(user?.roles) ? user!.roles! : user?.role ? [user.role] : [];
  const isAdmin = roles.includes('admin') || roles.includes('superadmin');

  // Vendor status resolution
  const isVendorApproved =
    isAdmin ||
    ((roles.includes('vendor') || user?.role === 'vendor') &&
      user?.vendorApprovalStatus === 'approved') ||
    Boolean(user?.restaurantId && user?.vendorApprovalStatus === 'approved');

  const isVendorPending = user?.vendorApprovalStatus === 'pending';
  const isVendorRejected = user?.vendorApprovalStatus === 'rejected';

  // Rider status resolution
  const isRiderApproved =
    isAdmin ||
    ((roles.includes('rider') || user?.role === 'rider') &&
      user?.riderApprovalStatus === 'approved');

  const isRiderPending = user?.riderApprovalStatus === 'pending';
  const isRiderRejected = user?.riderApprovalStatus === 'rejected';

  const hasPartnerRole = isVendorApproved || isRiderApproved;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isVendorApproved,
        isRiderApproved,
        isVendorPending,
        isRiderPending,
        isVendorRejected,
        isRiderRejected,
        hasPartnerRole,
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
