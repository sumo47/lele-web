'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, AlertTriangle, XCircle, ShieldAlert, ArrowLeft, Store, Bike, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function PartnerPendingScreen({ type }: { type: 'restaurant' | 'rider' | 'shop' }) {
  const { refreshUser, loading } = useAuth();
  const title = type === 'shop' ? 'Shop Partner' : type === 'restaurant' ? 'Restaurant Outlet' : 'Delivery Partner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-amber-200/60 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-9 h-9 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300/50">
            Verification In Progress
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {title} Application Under Review
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your {title.toLowerCase()} application has been submitted and is currently being verified by the LELE administration team. You will receive access as soon as it is approved.
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 text-left text-xs text-amber-900 space-y-2">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Verification Checklist
          </div>
          <ul className="list-disc pl-4 space-y-1 text-gray-700">
            <li>Identity and store ownership validation</li>
            <li>Catalog eligibility and location verification</li>
            <li>Admin activation within 24 business hours</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => refreshUser()}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Check Status
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PartnerRejectedScreen({
  type,
  reason,
}: {
  type: 'restaurant' | 'rider' | 'shop';
  reason?: string;
}) {
  const title = type === 'shop' ? 'Shop' : type === 'restaurant' ? 'Restaurant' : 'Rider';
  const applyHref = type === 'shop' ? '/partner/shop/apply' : type === 'restaurant' ? '/partner/restaurant/apply' : '/partner/rider/apply';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/50 via-white to-pink-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200/60 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <XCircle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300/50">
            Application Rejected
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {title} Application Not Approved
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your {title.toLowerCase()} partner application could not be approved by the administration team at this time.
          </p>
        </div>

        {reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left text-xs text-red-900">
            <span className="font-semibold block mb-1">Reason provided:</span>
            <p className="text-gray-800 italic">&ldquo;{reason}&rdquo;</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={applyHref}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
          >
            Re-apply Now
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PartnerBlockedScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-gray-900 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-100 text-red-800">
            Access Suspended
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Account Suspended</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This account has been suspended or restricted from accessing partner operations. Please reach out to LELE Partner Support if you believe this is in error.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PartnerUnauthorizedScreen({ type }: { type: 'restaurant' | 'rider' | 'shop' }) {
  const isRestaurant = type === 'restaurant';
  const isShop = type === 'shop';
  const applyHref = isShop ? '/partner/shop/apply' : isRestaurant ? '/partner/restaurant/apply' : '/partner/rider/apply';
  const title = isShop ? 'Shop Partner' : isRestaurant ? 'Restaurant Partner' : 'Delivery Rider';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          {isRestaurant ? <Store className="w-9 h-9" /> : <Bike className="w-9 h-9" />}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Partner with LELE
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your account is currently registered as a customer. To access the {title} Dashboard, please apply to join our verified partner network.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href={applyHref}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
          >
            Apply as {title}
          </Link>
          <Link
            href="/partner"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Explore Partner Opportunities
          </Link>
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors pt-2"
          >
            ← Back to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
