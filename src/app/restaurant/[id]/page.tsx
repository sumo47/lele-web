'use client';

import React, { useEffect, useState, useMemo, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { getRestaurantById, getRestaurantMenu, getRestaurantMenu as getMenu } from '@/lib/api';
import type { Restaurant, MenuItem } from '@/lib/types';
import DishCard from '@/components/ui/DishCard';
import { useCart } from '@/context/CartContext';

interface RestaurantPageProps {
  params: Promise<{ id: string }>;
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const { id } = use(params);
  const { items, openCart, totalItemsCount, subtotal } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    async function loadRestaurant() {
      setLoading(true);
      try {
        const [rest, menu] = await Promise.all([
          getRestaurantById(id),
          getRestaurantMenu(id),
        ]);
        setRestaurant(rest);
        setMenuItems(menu);
      } catch (err) {
        console.error('Failed to load restaurant details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadRestaurant();
    }
  }, [id]);

  // Unique categories in menu
  const menuCategories = useMemo(() => {
    const cats = new Set<string>();
    menuItems.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [menuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (vegOnly && !item.isVeg) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      return true;
    });
  }, [menuItems, vegOnly, selectedCategory]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-64 rounded-3xl shimmer" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-52 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Restaurant Not Found</h2>
        <p className="text-xs text-gray-500">
          This restaurant is either currently offline or unavailable.
        </p>
        <Link
          href="/catalog"
          className="inline-block bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-red-700 transition"
        >
          Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-8">
      
      {/* 1. RESTAURANT HERO HEADER */}
      <div className="bg-white border-b border-gray-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all restaurants</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
            {/* Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-red-50 text-red-600 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                  Verified Kitchen
                </span>
                {restaurant.isOpen ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Open Now
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-gray-400">Closed</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
                {restaurant.name}
              </h1>

              <p className="text-xs sm:text-sm text-gray-500">
                {restaurant.cuisines?.join(' • ')}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                {restaurant.rating && (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-extrabold">
                    <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    <span>{Number(restaurant.rating).toFixed(1)}</span>
                    <span className="text-gray-400 text-[10px]">({restaurant.totalReviews || 100}+ reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{restaurant.deliveryTime || '25-35 min'}</span>
                </div>
                {restaurant.priceForOne && (
                  <div>
                    <span>₹{restaurant.priceForOne} for one</span>
                  </div>
                )}
                {restaurant.address && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            {restaurant.imageUrl && (
              <div className="relative w-full md:w-56 h-36 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                <Image
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MENU CONTROLS & FILTER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-200">
          
          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Menu ({menuItems.length})
            </button>
            {menuCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition shrink-0 ${
              vegOnly
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Pure Veg Only</span>
          </button>
        </div>
      </div>

      {/* 3. MENU ITEMS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500 font-medium text-sm">
              No menu items match your selected filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((dish) => (
              <DishCard
                key={dish.id}
                item={dish}
                restaurantName={restaurant.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button for this restaurant */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-md mx-auto z-40">
          <button
            onClick={openCart}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between transition transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm">{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} added</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-black">
              <span>View Cart (₹{subtotal})</span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}

    </div>
  );
}
