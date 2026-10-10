'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Utensils, Store, Sparkles, Filter } from 'lucide-react';
import { searchCatalog } from '@/lib/api';
import type { Restaurant, MenuItem } from '@/lib/types';
import DishCard from '@/components/ui/DishCard';
import RestaurantCard from '@/components/ui/RestaurantCard';

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [queryText, setQueryText] = useState(initialQuery);
  const [filterType, setFilterType] = useState<'all' | 'dish' | 'restaurant'>('all');
  const [vegOnly, setVegOnly] = useState(false);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!initialQuery.trim()) {
        setRestaurants([]);
        setDishes([]);
        return;
      }

      setLoading(true);
      try {
        const res = await searchCatalog({
          q: initialQuery,
          type: filterType,
          veg: vegOnly ? true : undefined,
        });
        setRestaurants(res.restaurants || []);
        setDishes(res.dishes || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [initialQuery, filterType, vegOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryText.trim()) {
      router.push(`/search?q=${encodeURIComponent(queryText.trim())}`);
    }
  };

  const hasResults = restaurants.length > 0 || dishes.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Search Dishes &amp; Restaurants
        </h1>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search for biryani, pizza, sweets, chicken..."
            className="w-full pl-12 pr-28 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          />
          <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-2 top-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition"
          >
            Search
          </button>
        </form>

        {/* Quick popular search tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-gray-500 pt-1">
          <span>Popular:</span>
          {['Biryani', 'Pizza', 'Samosa', 'Paneer', 'Burger', 'Dal Makhani'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQueryText(tag);
                router.push(`/search?q=${encodeURIComponent(tag)}`);
              }}
              className="text-gray-700 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-full text-xs font-medium transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Options */}
      {initialQuery && (
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setFilterType('dish')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                filterType === 'dish'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dishes ({dishes.length})
            </button>
            <button
              onClick={() => setFilterType('restaurant')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                filterType === 'restaurant'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Restaurants ({restaurants.length})
            </button>
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              vegOnly
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Pure Veg</span>
          </button>
        </div>
      )}

      {/* Results Rendering */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 rounded-2xl shimmer" />
          ))}
        </div>
      ) : !initialQuery ? (
        <div className="p-16 text-center text-gray-400 text-sm">
          Type a food item or restaurant name above to begin searching.
        </div>
      ) : !hasResults ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-2xs space-y-3">
          <Utensils className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">
            No results found for &quot;{initialQuery}&quot;
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try checking spelling or search for popular items like Biryani, Pizza, or Samosa.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Matched Dishes */}
          {(filterType === 'all' || filterType === 'dish') && dishes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-red-600" />
                <span>Dishes ({dishes.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {dishes.map((dish) => (
                  <DishCard key={dish.id} item={dish} />
                ))}
              </div>
            </div>
          )}

          {/* Matched Restaurants */}
          {(filterType === 'all' || filterType === 'restaurant') && restaurants.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-red-600" />
                <span>Restaurants ({restaurants.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((rest) => (
                  <RestaurantCard key={rest.id} restaurant={rest} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center">Loading search...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
