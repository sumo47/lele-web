'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  MapPin,
  Star,
  Truck,
  RotateCcw,
  Bike,
  Sparkles,
  Loader2,
  Store,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { apiGetShops, apiGetShopCategoryTemplates } from '@/lib/api';
import type { CategoryTemplate, ShopProfile } from '@/lib/types';

const CATEGORY_ICONS: Record<string, string> = {
  clothing: '👗',
  books: '📚',
  electronics: '⚡',
  grocery: '🛒',
  stationery: '✏️',
  gifts: '🎁',
  general: '🏬',
};

export default function ShopsDiscoveryPage() {
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadShops = useCallback(async () => {
    setLoading(true);
    try {
      const [shopsRes, tplRes] = await Promise.allSettled([
        apiGetShops({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
        }),
        apiGetShopCategoryTemplates(),
      ]);

      if (shopsRes.status === 'fulfilled') {
        const val = shopsRes.value;
        const list = Array.isArray(val)
          ? val
          : Array.isArray(val?.data)
          ? val.data
          : [];
        setShops(list);
      }

      if (tplRes.status === 'fulfilled') {
        setTemplates(tplRes.value || []);
      }
    } catch (err: any) {
      console.error('Failed to load shops:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-purple-800 via-indigo-900 to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-200 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Local Hyperlocal Market</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            LELE <span className="text-purple-400">Shop</span>
          </h1>
          <p className="text-sm sm:text-base text-purple-100/90 max-w-2xl leading-relaxed">
            Shop directly from verified local merchants in Nirmali. From fashion &amp; books to electronics &amp; grocery — delivered quickly with guaranteed 24-hour returns &amp; exchanges.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shops, clothing, gadgets, stationery in Nirmali..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>✨</span>
            <span>All Shops</span>
          </button>

          {templates.map((tpl) => {
            const slug = tpl.slug || tpl.categorySlug;
            const icon = CATEGORY_ICONS[slug] || '🏬';
            const isSelected = selectedCategory === slug;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelectedCategory(slug)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{icon}</span>
                <span>{tpl.name}</span>
              </button>
            );
          })}
        </div>

        {/* Shops Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              {selectedCategory === 'all'
                ? 'All Local Stores'
                : `${templates.find((t) => (t.slug || t.categorySlug) === selectedCategory)?.name || 'Category'} Stores`}
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {shops.length} store{shops.length === 1 ? '' : 's'} available
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500 font-medium">Discovering local stores...</p>
            </div>
          ) : shops.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 p-8">
              <Store className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No stores found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                We couldn&apos;t find any active shops matching your selected criteria.
              </p>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition"
                >
                  View All Stores
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/shop/${shop.id}`}
                  className="group bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header Image / Banner */}
                    <div className="relative h-44 w-full bg-gradient-to-tr from-purple-100 to-indigo-50 overflow-hidden">
                      {shop.imageUrl ? (
                        <Image
                          src={shop.imageUrl}
                          alt={shop.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-purple-300">
                          <Store className="w-12 h-12" />
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 mt-2">
                            {shop.shopCategory}
                          </span>
                        </div>
                      )}

                      {/* Open / Closed Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
                            shop.isOpen
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-gray-800/80 text-gray-200'
                          }`}
                        >
                          {shop.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-white/90 text-purple-900 shadow-xs backdrop-blur-md">
                          {CATEGORY_ICONS[shop.shopCategory] || '🏬'} {shop.shopCategory}
                        </span>
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-black text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                          {shop.name}
                        </h3>
                        {shop.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                            {shop.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="truncate">{shop.location || shop.address || 'Nirmali Bazar'}</span>
                      </div>

                      {/* Delivery & Return Badges */}
                      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-gray-100">
                        {shop.selfDeliveryEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                            <Truck className="w-3 h-3" />
                            <span>Self-Delivery</span>
                          </span>
                        )}
                        {shop.riderDeliveryEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                            <Bike className="w-3 h-3" />
                            <span>LELE Fleet</span>
                          </span>
                        )}
                        {shop.returnPolicyEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold">
                            <RotateCcw className="w-3 h-3" />
                            <span>{shop.returnWindowHours || 24}h Returns</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visit Store Action */}
                  <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:bg-purple-50/50 transition-colors">
                    <span>Visit Store Catalog</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
