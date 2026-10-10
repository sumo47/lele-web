'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Compass, Filter, Utensils, Store, Search, SlidersHorizontal } from 'lucide-react';
import { getRestaurants, getCategories, searchCatalog } from '@/lib/api';
import type { Restaurant, MenuItem, Category } from '@/lib/types';
import RestaurantCard from '@/components/ui/RestaurantCard';
import DishCard from '@/components/ui/DishCard';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<'dishes' | 'restaurants'>('dishes');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);

  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, rests, catalogRes] = await Promise.all([
          getCategories(),
          getRestaurants(),
          searchCatalog({ q: searchTerm, veg: vegOnly ? true : undefined }),
        ]);
        setCategories(cats);
        setRestaurants(rests);
        setDishes(catalogRes.dishes || []);
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchTerm, vegOnly]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      if (vegOnly && !dish.isVeg) return false;
      if (
        selectedCategory &&
        dish.category.toLowerCase() !== selectedCategory.toLowerCase() &&
        !dish.category.toLowerCase().includes(selectedCategory.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [dishes, vegOnly, selectedCategory]);

  // Filtered restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((rest) => {
      if (
        selectedCategory &&
        !rest.cuisines?.some((c) => c.toLowerCase().includes(selectedCategory.toLowerCase()))
      ) {
        return false;
      }
      if (
        searchTerm &&
        !rest.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !rest.cuisines?.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });
  }, [restaurants, selectedCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Nirmali Food Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Explore All Food &amp; Restaurants
          </h1>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-3">
          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition ${
              vegOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Pure Veg</span>
          </button>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dishes')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'dishes'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Dishes ({filteredDishes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'restaurants'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Restaurants ({filteredRestaurants.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
            selectedCategory === ''
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory.toLowerCase() === cat.slug.toLowerCase()
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-2xl shimmer" />
          ))}
        </div>
      ) : activeTab === 'dishes' ? (
        filteredDishes.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <Utensils className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No dishes match your filters</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try clearing the category or Pure Veg filter to see more mouthwatering options.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setVegOnly(false);
              }}
              className="text-xs font-bold text-red-600 hover:underline pt-2 inline-block"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} item={dish} />
            ))}
          </div>
        )
      ) : filteredRestaurants.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-3">
          <Store className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No restaurants found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try searching for another cuisine or reset your filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((rest) => (
            <RestaurantCard key={rest.id} restaurant={rest} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center">Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
