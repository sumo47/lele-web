'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Bike,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PartnerHubPage() {
  const { user, isAuthenticated, isVendorApproved, isRiderApproved } = useAuth();

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
            Join Nirmali&apos;s fastest growing hyper-local ecosystem. Sell food to thousands of customers or earn daily delivery income on your own schedule.
          </p>

          {/* Quick Direct Links if already an approved partner */}
          {(isVendorApproved || isRiderApproved) && (
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
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

      {/* Main Two Tracks */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Restaurant Partner Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-xl hover:border-red-200 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Store className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                  For Restaurants & Shops
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-1">Restaurant Partner</h2>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  List your kitchen, dhaba, bakery, or sweet shop on Lele Store. Receive live online orders, manage prep times, and expand your customer reach in Nirmali.
                </p>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Kitchen Order Management Console</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom Digital Menu with Photo & Pricing Controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Guaranteed Direct Settlements & Transparent Accounting</span>
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
              ) : (
                <Link
                  href="/partner/restaurant/apply"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-md"
                >
                  <span>Register Your Restaurant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Delivery Rider Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-xl hover:border-emerald-200 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Bike className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  For Delivery Riders
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-1">Delivery Partner</h2>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Deliver food, groceries, and parcels across Nirmali. Earn guaranteed payouts per delivery with weekly automated bank transfers and full flexible hours.
                </p>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Guaranteed ₹40+ Base Delivery Payout Per Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Dispatch Pool & Flexible On/Off Duty Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Accidental Insurance & 24/7 Rider Support</span>
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
            <h3 className="font-bold text-sm text-gray-900">Can I switch between customer and partner mode?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yes! Your single account retains customer and partner access. You can order food for yourself anytime and switch to your Restaurant or Rider dashboard with one tap.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-2">
            <h3 className="font-bold text-sm text-gray-900">How long does partner verification take?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Once you submit required documentation (FSSAI licence for restaurants or driving licence for riders), our merchant team completes verification within 24–48 hours.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-2">
            <h3 className="font-bold text-sm text-gray-900">How are payouts settled?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Restaurant earnings and rider trip fees are settled directly into your registered bank account or UPI on a weekly schedule.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-2">
            <h3 className="font-bold text-sm text-gray-900">Do I need special equipment to start?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              For restaurants: an existing smartphone or laptop with internet. For riders: a smartphone and two-wheeler (motorcycle, scooter, or bicycle).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
