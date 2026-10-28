'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Store,
  BarChart3,
  Bike,
  Clock,
  Wallet,
  User,
  Menu,
  X,
  ArrowLeftRight,
  LogOut,
  Power,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserAvatar from '@/components/ui/UserAvatar';

interface PartnerLayoutProps {
  role: 'restaurant' | 'rider';
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PartnerLayout({
  role,
  title,
  subtitle,
  actions,
  children,
}: PartnerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isVendorApproved, isRiderApproved } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isRestaurant = role === 'restaurant';

  const restaurantNavItems = [
    {
      label: 'Overview',
      href: '/partner/restaurant',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Kitchen & Orders',
      href: '/partner/restaurant/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Menu Catalog',
      href: '/partner/restaurant/menu',
      icon: UtensilsCrossed,
    },
    {
      label: 'Outlet Profile',
      href: '/partner/restaurant/profile',
      icon: Store,
    },
    {
      label: 'Sales & Reports',
      href: '/partner/restaurant/reports',
      icon: BarChart3,
    },
  ];

  const riderNavItems = [
    {
      label: 'Overview',
      href: '/partner/rider',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Live Deliveries',
      href: '/partner/rider/deliveries',
      icon: Bike,
    },
    {
      label: 'Trip History',
      href: '/partner/rider/history',
      icon: Clock,
    },
    {
      label: 'Earnings & Wallet',
      href: '/partner/rider/earnings',
      icon: Wallet,
    },
    {
      label: 'Rider Profile',
      href: '/partner/rider/profile',
      icon: User,
    },
  ];

  const navItems = isRestaurant ? restaurantNavItems : riderNavItems;

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row antialiased text-gray-900">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href={isRestaurant ? '/partner/restaurant' : '/partner/rider'} className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-red-500/20">
              <Image src="/lele_logo.jpeg" alt="LELE" fill className="object-cover" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-gray-900">
              LELE <span className="text-red-600">{isRestaurant ? 'Kitchen' : 'Rider'}</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Store
          </Link>
          <UserAvatar name={user?.name} src={user?.avatarUrl} size="sm" />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-gray-200 shrink-0 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Link href={isRestaurant ? '/partner/restaurant' : '/partner/rider'} className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-red-500/20 shadow-xs group-hover:scale-105 transition-transform">
              <Image src="/lele_logo.jpeg" alt="LELE Logo" fill className="object-cover" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-gray-900 leading-none">
                LELE <span className="text-red-600">Partner</span>
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mt-1">
                {isRestaurant ? 'Kitchen Console' : 'Rider Operations'}
              </div>
            </div>
          </Link>
        </div>

        {/* User Badge Card */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <UserAvatar name={user?.name} src={user?.avatarUrl} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Partner'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    isRestaurant
                      ? 'bg-amber-500 ring-2 ring-amber-100'
                      : 'bg-emerald-500 ring-2 ring-emerald-100'
                  }`}
                />
                <span className="text-xs text-gray-500 truncate capitalize font-medium">
                  {isRestaurant
                    ? user?.restaurantName || 'Approved Restaurant'
                    : 'Verified Rider'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? isRestaurant
                      ? 'bg-red-50 text-red-700 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      active
                        ? isRestaurant
                          ? 'text-red-600'
                          : 'text-emerald-600'
                        : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {active && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      isRestaurant ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mode Switcher & Footer */}
        <div className="p-3 border-t border-gray-100 space-y-2 bg-gray-50/50">
          {/* Switch to other partner mode if available */}
          {isRestaurant && isRiderApproved && (
            <Link
              href="/partner/rider"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <Bike className="w-4 h-4" />
              <span>Switch to Rider Mode</span>
            </Link>
          )}

          {!isRestaurant && isVendorApproved && (
            <Link
              href="/partner/restaurant"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Switch to Restaurant Mode</span>
            </Link>
          )}

          {/* Return to Customer Storefront */}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-white border border-gray-200/80 shadow-xs transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4 text-gray-500" />
            <span>Customer Storefront</span>
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sliding Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-red-500/20">
              <Image src="/lele_logo.jpeg" alt="LELE" fill className="object-cover" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-gray-900">
              LELE {isRestaurant ? 'Kitchen' : 'Rider'}
            </span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? isRestaurant
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      active
                        ? isRestaurant
                          ? 'text-red-600'
                          : 'text-emerald-600'
                        : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
          <Link
            href="/"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200"
          >
            <ArrowLeftRight className="w-4 h-4 text-gray-500" />
            <span>Customer Storefront</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Action Bar */}
        <div className="bg-white border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
          </div>
        </div>

        {/* Page Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
