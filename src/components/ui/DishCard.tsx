'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, Heart, Star } from 'lucide-react';
import type { MenuItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface DishCardProps {
  item: MenuItem;
  restaurantName?: string;
}

export default function DishCard({ item, restaurantName }: DishCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();

  const cartEntry = items.find((it) => it.itemId === item.id);
  const inCartQuantity = cartEntry ? cartEntry.quantity : 0;
  const favored = isFavorite(item.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group">
      <div>
        {/* Image & Badges */}
        <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-gray-100 mb-3">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-semibold">
              No Image
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className={item.isVeg ? 'veg-badge shadow-sm' : 'nonveg-badge shadow-sm'} />
            {item.isBestseller && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                Bestseller
              </span>
            )}
          </div>

          {/* Wishlist toggle */}
          <button
            onClick={() => toggleFavorite(item.id)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-gray-500 hover:text-red-600 shadow-xs transition"
            aria-label="Save to favorites"
          >
            <Heart
              className={`w-3.5 h-3.5 ${favored ? 'fill-red-600 text-red-600' : ''}`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1 group-hover:text-red-600 transition">
              {item.name}
            </h3>
          </div>
          {item.category && (
            <p className="text-[11px] text-gray-400 font-medium">{item.category}</p>
          )}
          {item.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Price & Add to Cart action */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="font-extrabold text-base sm:text-lg text-gray-900">
            ₹{item.price}
          </span>
          {item.listingPrice && item.listingPrice > item.price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{item.listingPrice}
            </span>
          )}
        </div>

        {/* Add Button or Stepper */}
        {inCartQuantity > 0 ? (
          <div className="flex items-center gap-2 bg-red-600 text-white rounded-lg px-2.5 py-1 shadow-xs">
            <button
              onClick={() => updateQuantity(item.id, inCartQuantity - 1)}
              className="text-white hover:opacity-80 p-0.5"
              aria-label="Decrease"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold w-4 text-center">
              {inCartQuantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, inCartQuantity + 1)}
              className="text-white hover:opacity-80 p-0.5"
              aria-label="Increase"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(item, restaurantName)}
            disabled={!item.isAvailable || !item.inStock}
            className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-600 border border-red-300 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs hover:shadow transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>ADD</span>
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
