'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  Bike,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PartnerHubPage() {
  const {
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

  const isAnyPartnerApproved = isVendorApproved || isRiderApproved || isShopApproved;
  const isAnyPartnerPending = isVendorPending || isRiderPending || isShopPending;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
            <Sparkles className="w-3.5 h-3.5" /> LELE Partner Network
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Grow Your Business & Deliver with <span className="text-red-500">LELE</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join Nirmali&apos;s fastest growing hyper-local commerce network. Sell food, retail products, clothing, books, and electronics, or earn daily delivery income on your own schedule.
          </p>

          {/* Quick Direct Links if already an approved partner */}
          {isAnyPartnerApproved && (
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              {isShopApproved && (
                <Link
                  href="/partner/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition shadow-lg shadow-purple-600/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Launch Shop Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {isVendorApproved && (
                <Link
                  href="/partner/restaurant"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-gray-950 transition shadow-lg shadow-amber-500/20"
                >
                  <Store className="w-4 h-4" />
                  <span>Launch Restaurant Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {isRiderApproved && (
                <Link
                  href="/partner/rider"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-gray-950 transition shadow-lg shadow-emerald-500/20"
                >
                  <Bike className="w-4 h-4" />
                  <span>Launch Rider Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Three Tracks */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. General Shop Partner Card */}
          <div className="bg-white rounded-3xl p-7 border border-gray-200/90 shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Retail & Commerce
                </span>
                <h2 className="text-xl font-black text-gray-900 mt-1">Shop Partner</h2>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Sell clothing, books, electronics, grocery, stationery, gifts, and more. Manage variants, real-time inventory, and self-delivery or rider dispatch.
                </p>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Category-Based Attributes & Variants</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Atomic Stock Tracking & Audit Logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Seller Self-Delivery OR Rider Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>24-Hour Return & Exchange Management</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              {isShopApproved ? (
                <Link
                  href="/partner/shop"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-md"
                >
                  <span>Go to Shop Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isShopPending ? (
                <Link
                  href="/partner/shop"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 transition shadow-sm border border-purple-300"
                >
                  <span>Application Under Review</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isShopRejected ? (
                <Link
                  href="/partner/shop"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-red-900 bg-red-100 hover:bg-red-200 transition shadow-sm border border-red-300"
                >
                  <span>Rejected — View Status</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (isVendorApproved || isVendorPending || isRiderApproved || isRiderPending) ? (
                <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 text-center">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Single Partner Role Active</span>
                </div>
              ) : (
                <Link
                  href="/partner/shop/apply"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-md"
                >
                  <span>Register Your Shop</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* 2. Restaurant Partner Card */}
          <div className="bg-white rounded-3xl p-7 border border-gray-200/90 shadow-xl hover:border-orange-300 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Store className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                  Food & Dining
                </span>
                <h2 className="text-xl font-black text-gray-900 mt-1">Restaurant Partner</h2>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  List your kitchen, dhaba, restaurant, or bakery. Receive live food orders, manage prep times, and deliver across Nirmali.
                </p>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Kitchen Order Console</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom Digital Menu with Photos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fast Delivery Fleet Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Weekly Direct Bank Settlements</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              {isVendorApproved ? (
                <Link
                  href="/partner/restaurant"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-md"
                >
                  <span>Go to Restaurant Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isVendorPending ? (
                <Link
                  href="/partner/restaurant"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition shadow-sm border border-amber-300"
                >
                  <span>Application Under Review</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isVendorRejected ? (
                <Link
                  href="/partner/restaurant"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-red-900 bg-red-100 hover:bg-red-200 transition shadow-sm border border-red-300"
                >
                  <span>Rejected — View Status</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (isShopApproved || isShopPending || isRiderApproved || isRiderPending) ? (
                <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 text-center">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Single Partner Role Active</span>
                </div>
              ) : (
                <Link
                  href="/partner/restaurant/apply"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-md"
                >
                  <span>Register Restaurant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* 3. Delivery Rider Card */}
          <div className="bg-white rounded-3xl p-7 border border-gray-200/90 shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Bike className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Fleet & Logistics
                </span>
                <h2 className="text-xl font-black text-gray-900 mt-1">Delivery Partner</h2>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Deliver food, grocery, and shop products across Nirmali. Earn competitive trip payouts with weekly automated transfers and flexible hours.
                </p>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Guaranteed Base Payout Per Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Dispatch Pool & Flexible Shifts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Daily & Weekly Earnings Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated Rider Support Helpline</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              {isRiderApproved ? (
                <Link
                  href="/partner/rider"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md"
                >
                  <span>Go to Rider Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isRiderPending ? (
                <Link
                  href="/partner/rider"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 transition shadow-sm border border-blue-300"
                >
                  <span>Application Under Review</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isRiderRejected ? (
                <Link
                  href="/partner/rider"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-red-900 bg-red-100 hover:bg-red-200 transition shadow-sm border border-red-300"
                >
                  <span>Rejected — View Status</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (isShopApproved || isShopPending || isVendorApproved || isVendorPending) ? (
                <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 text-center">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Single Partner Role Active</span>
                </div>
              ) : (
                <Link
                  href="/partner/rider/apply"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md"
                >
                  <span>Apply to Deliver</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Partner FAQs */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-gray-500">Everything you need to know about partnering with LELE</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-2">
            <h3 className="font-bold text-sm text-gray-900">What is the Single Partner Role rule?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              To guarantee operational focus and prevent conflict of interest, each LELE account can hold only ONE partner role at a time (Rider, Restaurant Owner, or Shop Owner). You can always continue shopping as a customer with the same account.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-2">
            <h3 className="font-bold text-sm text-gray-900">How do returns work for Shop Partners?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              LELE provides an authoritative 24-hour return and exchange window for customers from delivery. Shop owners review return requests and can approve, reject, or complete them with automatic inventory restock.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-2">
            <h3 className="font-bold text-sm text-gray-900">Can shop sellers deliver their own orders?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yes! Shop partners can enable Seller Self-Delivery to deliver orders directly using their own store staff, or choose LELE Rider Fleet delivery for on-demand dispatch.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-2">
            <h3 className="font-bold text-sm text-gray-900">How long does verification take?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our onboarding team reviews partner submissions within 24 hours. Once approved, you gain immediate access to catalog and order management tools.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
