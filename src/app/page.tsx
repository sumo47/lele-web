'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Percent,
  Clock,
  ShieldCheck,
  Truck,
  ChevronRight,
  Flame,
  UtensilsCrossed,
  Tag,
} from 'lucide-react';
import { getHeroBanners, getCategories, getRestaurants, searchCatalog } from '@/lib/api';
import type { HeroBanner, Category, Restaurant, MenuItem } from '@/lib/types';
import RestaurantCard from '@/components/ui/RestaurantCard';
import DishCard from '@/components/ui/DishCard';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const { applyCouponCode, openCart } = useCart();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [trendingDishes, setTrendingDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCopied, setCouponCopied] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [bannersData, categoriesData, restaurantsData, catalogData] = await Promise.all([
          getHeroBanners(),
          getCategories(),
          getRestaurants({ limit: 6 }),
          searchCatalog({ q: '', type: 'dish' }),
        ]);

        setBanners(bannersData);
        setCategories(categoriesData);
        setRestaurants(restaurantsData);
        setTrendingDishes(catalogData.dishes?.slice(0, 8) || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    applyCouponCode(code);
    setCouponCopied(true);
    openCart();
    setTimeout(() => setCouponCopied(false), 3000);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-red-50/70 via-white to-transparent pt-6 sm:pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Hero Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-900 via-red-800 to-rose-950 text-white shadow-xl min-h-[360px] sm:min-h-[420px] flex items-center">
            {/* Background Texture & Image */}
            <div className="absolute inset-0 opacity-25 mix-blend-overlay">
              <Image
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
                alt="Food Background"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 bg-red-700/80 backdrop-blur-sm border border-red-500/40 text-red-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Nirmali&apos;s #1 Online Food Delivery</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
                Authentic Biryani &amp; Fresh Meals, <span className="text-amber-300">Delivered Fast.</span>
              </h1>

              <p className="text-sm sm:text-base text-red-100/90 leading-relaxed max-w-lg">
                Freshly cooked from local Nirmali kitchens. Enjoy doorstep delivery with live tracking and flexible Cash on Delivery or UPI payments.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/catalog"
                  className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-extrabold text-sm px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition flex items-center gap-2 group"
                >
                  <span>Explore Restaurants</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>

                <button
                  onClick={() => handleCopyCoupon('WELCOME50')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3.5 rounded-full transition flex items-center gap-2"
                >
                  <Tag className="w-4 h-4 text-amber-300" />
                  <span>Use Code: <strong>WELCOME50</strong></span>
                </button>
              </div>

              {/* Quick perks */}
              <div className="pt-4 flex items-center gap-6 text-xs text-red-200 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>25-35 Min Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-300" />
                  <span>Free Delivery on ₹500+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Promo Grid */}
          {banners.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {banners.map((b) => (
                <Link
                  key={b.id}
                  href={b.link || '/catalog'}
                  className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition aspect-16/7 sm:aspect-16/8 bg-gray-900 flex items-end p-4 text-white"
                >
                  <Image
                    src={b.image_url || b.imageUrl || ''}
                    alt={b.title || 'Promo Banner'}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300 opacity-60"
                  />
                  <div className="relative z-10">
                    <h3 className="font-bold text-sm sm:text-base leading-snug drop-shadow-sm">{b.title}</h3>
                    {b.subtitle && (
                      <p className="text-xs text-gray-200 line-clamp-1 drop-shadow-sm">{b.subtitle}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-extrabold text-xs uppercase tracking-wider">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>What are you craving?</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
              Popular Categories
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-2xs hover:shadow-md hover:border-red-100 transition flex flex-col items-center text-center space-y-2"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-red-50 flex items-center justify-center group-hover:scale-105 transition">
                {cat.image_url || cat.imageUrl ? (
                  <Image
                    src={cat.image_url || cat.imageUrl || ''}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <UtensilsCrossed className="w-7 h-7 text-red-600" />
                )}
              </div>
              <span className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-red-600 transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. PROMOTIONAL COUPON STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Percent className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="bg-black/30 text-amber-200 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                Limited Time Offer
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1">
                Get 50% OFF up to ₹100 on your first order
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 mt-0.5">
                Valid on minimum orders above ₹150 across all Nirmali kitchens.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2.5 rounded-xl font-mono font-black text-lg tracking-wider">
              WELCOME50
            </div>
            <button
              onClick={() => handleCopyCoupon('WELCOME50')}
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow transition"
            >
              {couponCopied ? 'Applied!' : 'Apply Coupon'}
            </button>
          </div>
        </div>
      </section>

      {/* 4. TOP RESTAURANTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-extrabold text-xs uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>Verified Kitchens</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
              Top Restaurants in Nirmali
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>See All ({restaurants.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl shimmer" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">No restaurants currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest) => (
              <RestaurantCard key={rest.id} restaurant={rest} />
            ))}
          </div>
        )}
      </section>

      {/* 5. TRENDING DISHES (1-Click Order) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
              Trending Dishes Today
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>Browse Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-60 rounded-2xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingDishes.map((dish) => (
              <DishCard key={dish.id} item={dish} />
            ))}
          </div>
        )}
      </section>

      {/* 6. TRUST & QUALITY PROMISES */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-gray-900">Ultra-Fast Delivery</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dedicated local delivery riders ensure your food arrives fresh, steaming hot, and on time.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-gray-900">100% Certified Kitchens</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Every restaurant partner follows rigorous cleanliness and food safety hygiene standards.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-gray-900">Best Price Guarantee</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Direct menu pricing with no hidden markups, plus genuine discounts and free delivery deals.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
