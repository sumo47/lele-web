'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  Menu,
  X,
  LogOut,
  Package,
  Home,
  Compass,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getPublicConfig } from '@/lib/api';
import UserAvatar from '@/components/ui/UserAvatar';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isVendorApproved, isRiderApproved } = useAuth();
  const { totalItemsCount, openCart } = useCart();
  const { favorites } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [onboardingEnabled, setOnboardingEnabled] = useState(true);

  useEffect(() => {
    getPublicConfig()
      .then((cfg) => {
        if (cfg && cfg.partnerOnboardingEnabled === false) {
          setOnboardingEnabled(false);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isPartnerDashboard =
    pathname?.startsWith('/partner/restaurant') || pathname?.startsWith('/partner/rider');

  if (isPartnerDashboard) {
    return null;
  }

  return (
    <>
      {/* Top Banner */}
      <div className="bg-red-700 text-white text-xs py-1.5 px-4 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-red-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Fast Delivery
            </span>
            <span>⚡ Piping hot food delivered in 25-35 mins across Nirmali, Bihar</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-red-100">
            {onboardingEnabled && (
              <>
                <Link href="/partner/rider" className="hover:text-white transition font-semibold text-yellow-300">
                  🛵 Become a Rider
                </Link>
                <span className="opacity-40">|</span>
                <Link href="/partner/restaurant" className="hover:text-white transition font-semibold text-yellow-300">
                  🏬 Become a Shop
                </Link>
                <span className="opacity-40">|</span>
              </>
            )}
            <span>Call: +91 8757962224</span>
            <span className="opacity-40">|</span>
            <Link href="/about" className="hover:text-white transition">About LELE</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-red-100 shadow-sm transition transform group-hover:scale-105">
                <Image
                  src="/lele_logo.jpeg"
                  alt="LELE Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-gray-900 leading-none">
                  LELE<span className="text-red-600">.</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Food & Store
                </span>
              </div>
            </Link>

            {/* Location selector */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200/80 text-xs text-gray-700 transition cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="font-semibold text-gray-900">Nirmali</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 truncate max-w-[120px]">Bihar 847452</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for biryani, pizza, sweets, or restaurants..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            </form>
          </div>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-600">
              <Link href="/catalog" className="hover:text-red-600 transition flex items-center gap-1">
                <Compass className="w-4 h-4" />
                Explore
              </Link>
              <Link href="/orders" className="hover:text-red-600 transition flex items-center gap-1">
                <Package className="w-4 h-4" />
                Orders
              </Link>
            </nav>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              title="Favorites"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-full font-semibold text-sm shadow-sm hover:shadow transition"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalItemsCount > 0 && (
                <span className="bg-white text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Account / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 border border-gray-200 rounded-full hover:border-gray-300 transition"
                  aria-label="User Account Menu"
                >
                  <UserAvatar
                    src={user?.avatarUrl}
                    name={user?.name}
                    size="sm"
                  />
                  <span className="text-xs font-semibold text-gray-800 hidden sm:inline truncate max-w-[90px]">
                    {user?.name || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2.5 mb-1">
                        <UserAvatar
                          src={user?.avatarUrl}
                          name={user?.name}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Profile & Details
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      Order History
                    </Link>
                    <Link
                      href="/addresses"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      Saved Addresses
                    </Link>
                    {/* Partner Links */}
                    <div className="border-t border-gray-100 my-1"></div>
                    <div className="px-4 py-1 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Partner Portal
                    </div>

                    {isVendorApproved && (
                      <Link
                        href="/partner/restaurant"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-amber-700 bg-amber-50/60 hover:bg-amber-100 transition"
                      >
                        🏬 Restaurant Dashboard
                      </Link>
                    )}

                    {isRiderApproved && (
                      <Link
                        href="/partner/rider"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 transition"
                      >
                        🛵 Rider Dashboard
                      </Link>
                    )}

                    {!isVendorApproved && !isRiderApproved && onboardingEnabled && (
                      <>
                        <Link
                          href="/partner/rider/apply"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                        >
                          🛵 Become a Rider
                        </Link>
                        <Link
                          href="/partner/restaurant/apply"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition"
                        >
                          🏬 Become a Restaurant Partner
                        </Link>
                      </>
                    )}

                    <Link
                      href="/partner"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                      🤝 Partner Hub
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-red-600 px-3 py-2 rounded-full hover:bg-gray-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-full transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or restaurants..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          </form>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
            <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg text-xs text-gray-600">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Delivering to: <strong className="text-gray-900">Nirmali, Bihar</strong></span>
            </div>
            <nav className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
              <Link
                href="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-lg flex items-center gap-3"
              >
                <Compass className="w-5 h-5 text-red-600" />
                Explore All Food & Restaurants
              </Link>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-lg flex items-center gap-3"
              >
                <Package className="w-5 h-5 text-red-600" />
                My Orders
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-lg flex items-center gap-3"
              >
                <Heart className="w-5 h-5 text-red-600" />
                Favorites ({favorites.length})
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-lg flex items-center gap-3"
              >
                <User className="w-5 h-5 text-red-600" />
                Account Profile
              </Link>
              {onboardingEnabled && (
                <div className="pt-2 border-t border-gray-100 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-2">Partner with LELE</span>
                  <Link
                    href="/partner/rider"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                  >
                    🛵 Become a Delivery Rider
                  </Link>
                  <Link
                    href="/partner/restaurant"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-xs font-semibold text-orange-600 hover:bg-orange-50 rounded-lg flex items-center gap-2"
                  >
                    🏬 Become a Shop / Restaurant
                  </Link>
                </div>
              )}
            </nav>
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-bold text-gray-700 border border-gray-300 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-bold text-white bg-red-600 rounded-lg"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({user?.name})
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (App-like feel) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden flex items-center justify-around py-2 px-1 shadow-lg">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-600">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/catalog" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-600">
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>
        <button
          onClick={openCart}
          className="relative flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-600"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>
        <Link href="/orders" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-600">
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>
        <Link href={isAuthenticated ? "/account" : "/login"} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-600">
          {isAuthenticated ? (
            <UserAvatar src={user?.avatarUrl} name={user?.name} size="xs" />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] font-medium">{isAuthenticated ? "Profile" : "Sign In"}</span>
        </Link>
      </div>
    </>
  );
}
