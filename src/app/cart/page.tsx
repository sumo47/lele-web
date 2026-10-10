'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    restaurantName,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
    subtotal,
    deliveryFee,
    convenienceFee,
    discount,
    total,
    totalItemsCount,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (code?: string) => {
    const c = code || couponInput;
    if (!c.trim()) return;

    setApplying(true);
    setCouponFeedback(null);
    try {
      const res = await applyCouponCode(c);
      if (res.success) {
        setCouponFeedback({ type: 'success', message: res.message });
        setCouponInput('');
      } else {
        setCouponFeedback({ type: 'error', message: res.message });
      }
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Your Cart is Empty</h1>
          <p className="text-sm text-gray-500 mt-2">
            Looks like you haven&apos;t added any food to your cart yet. Explore our delicious Nirmali kitchens!
          </p>
        </div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-7 py-3.5 rounded-full shadow transition"
        >
          <span>Explore Food Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Shopping Cart</h1>
          {restaurantName && (
            <p className="text-xs text-gray-500 mt-1">
              Ordering from: <strong className="text-gray-800">{restaurantName}</strong>
            </p>
          )}
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Cart Items ({totalItemsCount})
            </h2>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.itemId} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={item.isVeg ? 'veg-badge shrink-0' : 'nonveg-badge shrink-0'} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">₹{item.price} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1">
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        className="text-gray-500 hover:text-red-600 p-0.5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        className="text-gray-500 hover:text-emerald-600 p-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="font-extrabold text-sm text-gray-900 w-16 text-right">
                      ₹{item.price * item.quantity}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.itemId)}
                      className="text-gray-300 hover:text-red-600 transition p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline pt-2"
          >
            <span>+ Add more items from menu</span>
          </Link>
        </div>

        {/* Right: Bill Summary & Coupon */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Coupon Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
              <Tag className="w-4 h-4 text-red-600" />
              <span>Coupons &amp; Offers</span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs">
                <div>
                  <p className="font-bold">Code &quot;{appliedCoupon.code}&quot; applied!</p>
                  <p className="text-[11px] text-emerald-700">You saved ₹{appliedCoupon.discountAmount}</p>
                </div>
                <button
                  onClick={removeCouponCode}
                  className="text-red-600 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ENTER COUPON CODE"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={applying || !couponInput.trim()}
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition"
                  >
                    Apply
                  </button>
                </div>

                {couponFeedback && (
                  <p
                    className={`text-xs font-medium flex items-center gap-1 ${
                      couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {couponFeedback.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{couponFeedback.message}</span>
                  </p>
                )}

                {/* Available Quick Codes */}
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {['WELCOME50', 'LELEFREE', 'FEAST20'].map((c) => (
                    <button
                      key={c}
                      onClick={() => handleApplyCoupon(c)}
                      className="text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-full transition"
                    >
                      %{c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bill Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Bill Details
            </h2>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-emerald-600">FREE</strong>
                  ) : (
                    `₹${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Govt Taxes &amp; Platform Fee</span>
                <span>₹{convenienceFee.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-base text-gray-900">
                <span>To Pay</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-between text-sm"
            >
              <span>Proceed to Checkout</span>
              <div className="flex items-center gap-1.5">
                <span>₹{total.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe payments via Cash on Delivery or UPI</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
