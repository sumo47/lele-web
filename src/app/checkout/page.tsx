'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Plus,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { apiGetAddresses, apiCreateAddress, apiCreateOrder, apiGetCart, apiAddToCart } from '@/lib/api';
import type { CustomerAddress } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    items,
    restaurantName,
    subtotal,
    deliveryFee,
    convenienceFee,
    discount,
    total,
    appliedCoupon,
    clearCart,
  } = useCart();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // New address modal/form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newTitle, setNewTitle] = useState('Home');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  // Checkout inputs
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'WALLET'>('COD');

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Sync user details
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

  // Load addresses when authenticated
  useEffect(() => {
    async function loadUserAddresses() {
      if (!isAuthenticated) return;
      setLoadingAddresses(true);
      try {
        const list = await apiGetAddresses();
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) {
          setSelectedAddressId(def.id);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }

    loadUserAddresses();
  }, [isAuthenticated]);

  // Save new address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine.trim()) return;

    setSavingAddress(true);
    try {
      const created = await apiCreateAddress({
        title: newTitle,
        addressLine: newAddressLine,
        landmark: newLandmark,
        city: 'Nirmali',
        state: 'Bihar',
        postalCode: '847452',
        isDefault: addresses.length === 0,
      });

      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
      setNewAddressLine('');
      setNewLandmark('');
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Place Order
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Determine delivery address string
    let finalAddress = '';
    const selected = addresses.find((a) => a.id === selectedAddressId);
    if (selected) {
      finalAddress = `${selected.title}: ${selected.addressLine}${
        selected.landmark ? `, Near ${selected.landmark}` : ''
      }, Nirmali, Bihar`;
    } else if (newAddressLine.trim()) {
      finalAddress = `${newTitle}: ${newAddressLine}${
        newLandmark ? `, Near ${newLandmark}` : ''
      }, Nirmali, Bihar`;
    }

    if (!finalAddress || finalAddress.length < 5) {
      setOrderError('Please select or enter a delivery address');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      setOrderError('Please provide a valid 10-digit phone number for delivery contact');
      return;
    }

    setSubmittingOrder(true);
    setOrderError(null);

    try {
      // Authoritative sync: ensure PostgreSQL carts table has the user's items
      const backendCart = await apiGetCart().catch(() => null);
      if (!backendCart || !Array.isArray(backendCart.items) || backendCart.items.length === 0) {
        for (const it of items) {
          await apiAddToCart({ itemId: it.itemId, quantity: it.quantity }).catch(() => {});
        }
      }

      const order = await apiCreateOrder({
        deliveryAddress: finalAddress,
        customerName: customerName || user?.name || 'Customer',
        customerPhone: customerPhone || '+918757962224',
        cookingInstructions: cookingInstructions.trim(),
        couponCode: appliedCoupon?.code,
      });

      // Clear cart
      await clearCart();

      // Navigate to order confirmation
      router.push(`/order-success/${order.id}`);
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Sign in to Checkout</h1>
          <p className="text-xs text-gray-500 mt-1">
            Please log in or register to complete your order and track live delivery.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login?redirect=/checkout"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup?redirect=/checkout"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 rounded-xl transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Checkout &amp; Delivery</h1>
        {restaurantName && (
          <p className="text-xs text-gray-500 mt-1">
            Ordering from certified kitchen: <strong className="text-gray-800">{restaurantName}</strong>
          </p>
        )}
      </div>

      {orderError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Address, Phone, Instructions, Payment */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Delivery Address */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
              </div>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddressForm ? 'Cancel' : 'Add New'}</span>
              </button>
            </div>

            {/* Saved Addresses Selector */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="space-y-2.5">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      selectedAddressId === addr.id
                        ? 'border-red-600 bg-red-50/30 ring-1 ring-red-600'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="addressRadio"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-red-600 focus:ring-red-500"
                      />
                      <div className="space-y-0.5 flex-1 text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-gray-900 font-bold">{addr.title || 'Home'}</strong>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 leading-relaxed">{addr.addressLine}</p>
                        {addr.landmark && (
                          <p className="text-gray-400">Landmark: {addr.landmark}</p>
                        )}
                        <p className="text-gray-500">{addr.city || 'Nirmali'}, Bihar - {addr.postalCode || '847452'}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Address Add / Entry Form */}
            {(showAddressForm || addresses.length === 0) && (
              <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Work', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTitle(t)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        newTitle === t
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    House / Flat / Street Address *
                  </label>
                  <textarea
                    rows={2}
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    placeholder="e.g. Ward No 4, Near Gandhi Chowk, Station Road"
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    placeholder="e.g. Opposite Durga Temple"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl disabled:opacity-50 transition"
                  >
                    {savingAddress ? 'Saving...' : 'Save & Deliver Here'}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* 2. Contact Phone & Name */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Recipient Contact Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  10-Digit Mobile Number * (For delivery pin)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cooking / Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={cookingInstructions}
                onChange={(e) => setCookingInstructions(e.target.value)}
                placeholder="e.g. Less spicy, Extra green chutney, Ring bell"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Select Payment Method</h2>
            
            <div className="space-y-3">
              {/* COD */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-red-600 bg-red-50/30 ring-1 ring-red-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</h3>
                    <p className="text-[11px] text-gray-500">Active &amp; Supported: Pay cash or UPI QR directly to delivery partner at doorstep</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                  Active
                </span>
              </label>

              {/* UPI */}
              <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50 opacity-75">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payMethod"
                    disabled
                    checked={false}
                    className="text-gray-400"
                  />
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Online UPI / Payment Gateway</h3>
                    <p className="text-[11px] text-gray-500">Unintegrated Gateway: Live Razorpay/Paytm gateway pending production webhook credentials</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Gateway Pending
                </span>
              </label>

              {/* Wallet */}
              <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50 opacity-75">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payMethod"
                    disabled
                    checked={false}
                    className="text-gray-400"
                  />
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">LELE Wallet</h3>
                    <p className="text-[11px] text-gray-500">Unintegrated Gateway: Digital wallet balance integration in progress</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              </label>
            </div>
          </div>

        </div>

        {/* Right Col: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Order Summary
            </h2>

            {/* Items snippet */}
            <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.itemId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={it.isVeg ? 'veg-badge shrink-0' : 'nonveg-badge shrink-0'} />
                    <span className="font-semibold text-gray-800">{it.name} × {it.quantity}</span>
                  </div>
                  <span className="font-bold text-gray-900">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Bill summary */}
            <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Govt Taxes &amp; Platform Fee</span>
                <span>₹{convenienceFee.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-lg text-gray-900">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={submittingOrder || items.length === 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <span>{submittingOrder ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>By placing your order, you agree to LELE Terms of Service</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
