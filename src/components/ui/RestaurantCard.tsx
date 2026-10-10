'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, MapPin, Heart } from 'lucide-react';
import type { Restaurant } from '@/lib/types';
import { useWishlist } from '@/context/WishlistContext';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { isFavorite, toggleFavorite } = useWishlist();
  const favored = isFavorite(restaurant.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg transition duration-200 overflow-hidden flex flex-col group">
      {/* Banner / Image */}
      <div className="relative w-full aspect-16/10 bg-gray-100 overflow-hidden">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold">
            LELE Kitchen
          </div>
        )}

        {/* Gradient shadow for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
          {restaurant.isPromoted && (
            <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
              Featured
            </span>
          )}
          {!restaurant.isOpen && (
            <span className="bg-gray-800 text-gray-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              Closed Now
            </span>
          )}
        </div>

        {/* Favorite toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(restaurant.id);
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-gray-600 hover:text-red-600 shadow-sm transition"
          aria-label="Favorite restaurant"
        >
          <Heart className={`w-4 h-4 ${favored ? 'fill-red-600 text-red-600' : ''}`} />
        </button>

        {/* Bottom image overlay stats */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{restaurant.deliveryTime || '25-35 min'}</span>
          </div>
          {restaurant.priceForOne && (
            <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
              ₹{restaurant.priceForOne} for one
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base text-gray-900 group-hover:text-red-600 transition truncate">
              {restaurant.name}
            </h3>
            {restaurant.rating && (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold text-xs shrink-0">
                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                <span>{Number(restaurant.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Cuisines */}
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {restaurant.cuisines?.length ? restaurant.cuisines.join(' • ') : 'Delicious food & snacks'}
          </p>

          {/* Location */}
          {restaurant.address && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-2">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{restaurant.address}</span>
            </div>
          )}
        </div>

        {/* Action Link */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-red-600 group-hover:translate-x-1 transition duration-200">
            View Menu →
          </span>
          <Link
            href={`/restaurant/${restaurant.id}`}
            className="absolute inset-0"
            aria-label={`View ${restaurant.name} menu`}
          />
        </div>
      </div>
    </div>
  );
}
