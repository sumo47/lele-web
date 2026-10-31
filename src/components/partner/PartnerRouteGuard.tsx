'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  PartnerPendingScreen,
  PartnerRejectedScreen,
  PartnerBlockedScreen,
  PartnerUnauthorizedScreen,
} from './PartnerStatusScreens';

interface PartnerRouteGuardProps {
  role: 'vendor' | 'rider' | 'shop';
  children: React.ReactNode;
}

export function PartnerRouteGuard({ role, children }: PartnerRouteGuardProps) {
  const pathname = usePathname();
  const {
    user,
    loading,
    isAuthenticated,
    isVendorApproved,
    isRiderApproved,
    isShopApproved,
    isVendorPending,
    isRiderPending,
    isShopPending,
    isVendorRejected,
    isRiderRejected,
    isShopRejected,
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-500/20">
            <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-500 tracking-wide">
          Authenticating Partner Access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Partner Sign-In Required
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Please log in to your LELE Partner account to manage your{' '}
              {role === 'vendor' ? 'restaurant kitchen orders' : 'delivery assignments'}.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname || (role === 'vendor' ? '/partner/restaurant' : '/partner/rider'))}`}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
            >
              Sign In to Continue <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check account suspension
  if (user.role === 'blocked' || (user as any).isBlocked || (user as any).is_blocked) {
    return <PartnerBlockedScreen />;
  }

  // Restaurant Partner Checks
  if (role === 'vendor') {
    if (isVendorApproved) {
      return <>{children}</>;
    }
    if (isVendorPending) {
      return <PartnerPendingScreen type="restaurant" />;
    }
    if (isVendorRejected) {
      return (
        <PartnerRejectedScreen
          type="restaurant"
          reason={(user as any).blockReason || (user as any).block_reason}
        />
      );
    }
    return <PartnerUnauthorizedScreen type="restaurant" />;
  }

  // Rider Partner Checks
  if (role === 'rider') {
    if (isRiderApproved) {
      return <>{children}</>;
    }
    if (isRiderPending) {
      return <PartnerPendingScreen type="rider" />;
    }
    if (isRiderRejected) {
      return (
        <PartnerRejectedScreen
          type="rider"
          reason={(user as any).blockReason || (user as any).block_reason}
        />
      );
    }
    return <PartnerUnauthorizedScreen type="rider" />;
  }

  // Shop Partner Checks
  if (role === 'shop') {
    if (isShopApproved) {
      return <>{children}</>;
    }
    if (isShopPending) {
      return <PartnerPendingScreen type="shop" />;
    }
    if (isShopRejected) {
      return (
        <PartnerRejectedScreen
          type="shop"
          reason={(user as any).blockReason || (user as any).block_reason}
        />
      );
    }
    return <PartnerUnauthorizedScreen type="shop" />;
  }

  return <>{children}</>;
}
