'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    restaurantName,
    isCartOpen,
    closeCart,
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
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;

    setApplyingCoupon(true);
    setCouponFeedback(null);
    try {
      const res = await applyCouponCode(code);
      if (res.success) {
        setCouponFeedback({ type: 'success', message: res.message });
        setCouponInput('');
      } else {
        setCouponFeedback({ type: 'error', message: res.message });
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckoutClick = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">My Cart</h2>
                {restaurantName && (
                  <p className="text-xs text-gray-500 truncate max-w-[220px]">
                    From: <span className="font-semibold text-gray-700">{restaurantName}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List / Empty State */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Your cart is empty</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Explore delicious food from local Nirmali restaurants and add items to your cart.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    router.push('/catalog');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm transition"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
                  <span>{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in cart</span>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-medium hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {items.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs hover:border-gray-200 transition"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className={item.isVeg ? 'veg-badge shrink-0' : 'nonveg-badge shrink-0'} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">₹{item.price}</p>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 shrink-0">
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

                    <p className="text-xs font-bold text-gray-900 w-14 text-right shrink-0">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}

                {/* Coupon Box */}
                <div className="pt-2">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <Tag className="w-3.5 h-3.5 text-red-600" />
                      <span>Have a Coupon?</span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-xs">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Code <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discountAmount})</span>
                        </div>
                        <button
                          onClick={removeCouponCode}
                          className="text-red-600 hover:underline font-bold text-[11px]"
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
                            placeholder="e.g. WELCOME50"
                            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs uppercase font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                          <button
                            onClick={() => handleApplyCoupon()}
                            disabled={applyingCoupon || !couponInput.trim()}
                            className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50 transition"
                          >
                            Apply
                          </button>
                        </div>
                        {couponFeedback && (
                          <div
                            className={`flex items-center gap-1 text-[11px] font-medium ${
                              couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {couponFeedback.type === 'success' ? (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>{couponFeedback.message}</span>
                          </div>
                        )}
                        {/* Quick Coupon Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {['WELCOME50', 'LELEFREE', 'FEAST20'].map((code) => (
                            <button
                              key={code}
                              onClick={() => handleApplyCoupon(code)}
                              className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-full transition"
                            >
                              %{code}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Bill Details */}
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100 space-y-2 text-xs">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Bill Summary</h4>
                  <div className="flex justify-between text-gray-600">
                    <span>Item Total</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Partner Fee</span>
                    <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform / Govt Fee</span>
                    <span>₹{convenienceFee.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-sm text-gray-900">
                    <span>To Pay</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-white shadow-lg space-y-2">
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm hover:shadow transition flex items-center justify-between"
              >
                <div className="text-left">
                  <span className="text-[11px] block text-red-100 uppercase tracking-wider">Total Amount</span>
                  <span className="text-base font-extrabold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
              <p className="text-[10px] text-center text-gray-400">
                Guaranteed authentic food from certified Nirmali kitchens
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
