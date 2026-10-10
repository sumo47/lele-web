'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { getRestaurants, getRestaurantMenu } from '@/lib/api';
import type { MenuItem, Restaurant } from '@/lib/types';
import DishCard from '@/components/ui/DishCard';
import RestaurantCard from '@/components/ui/RestaurantCard';
import { Heart, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

export default function WishlistPage() {
  const { favorites, toggleFavorite } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [favoriteDishes, setFavoriteDishes] = useState<MenuItem[]>([]);

  useEffect(() => {
    async function loadWishlistItems() {
      if (favorites.length === 0) {
        setFavoriteRestaurants([]);
        setFavoriteDishes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Load all restaurants to match favorite restaurant IDs
        const restaurants = await getRestaurants({ limit: 50 });
        const matchedRestaurants = restaurants.filter((r) => favorites.includes(r.id));
        setFavoriteRestaurants(matchedRestaurants);

        // Load menus from the first few restaurants to match favorite dish IDs
        const dishPromises = restaurants.map((r) => getRestaurantMenu(r.id).catch(() => []));
        const allMenus = await Promise.all(dishPromises);
        const flattenedDishes = allMenus.flat();
        const matchedDishes = flattenedDishes.filter((d) => favorites.includes(d.id));
        setFavoriteDishes(matchedDishes);
      } catch (err) {
        console.error('Failed to load wishlist items', err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistItems();
  }, [favorites]);

  const totalItems = favoriteRestaurants.length + favoriteDishes.length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#E23744] fill-[#E23744]" />
              My Wishlist
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Your favorite kitchens and mouth-watering dishes in Nirmali
            </p>
          </div>
          {totalItems > 0 && (
            <span className="text-xs font-semibold px-3 py-1 bg-red-50 text-[#E23744] rounded-full border border-red-200">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#E23744] animate-spin" />
          </div>
        ) : totalItems === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#E23744] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-xs text-gray-500 mb-6">
              Explore our best restaurants and tap the heart icon on any dish or restaurant to save it here.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E23744] text-white text-sm font-semibold rounded-xl hover:bg-[#d02835] shadow-sm transition"
            >
              Explore Restaurants
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Favorite Restaurants */}
            {favoriteRestaurants.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Saved Kitchens</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Dishes */}
            {favoriteDishes.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Saved Dishes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteDishes.map((dish) => (
                    <DishCard key={dish.id} item={dish} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
