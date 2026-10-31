'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPublicConfig, apiApplyShopPartner, apiGetShopCategoryTemplates } from '@/lib/api';
import type { CategoryTemplate } from '@/lib/types';
import {
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Lock,
  Clock,
  Store,
  Bike,
  Sparkles,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function BecomeShopPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    isVendorApproved,
    isVendorPending,
    isRiderApproved,
    isRiderPending,
    isShopApproved,
    isShopPending,
  } = useAuth();

  const [configLoading, setConfigLoading] = useState(true);
  const [onboardingEnabled, setOnboardingEnabled] = useState(true);
  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [shopName, setShopName] = useState('');
  const [categoryTemplateSlug, setCategoryTemplateSlug] = useState('general');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('Nirmali Bazar');
  const [city, setCity] = useState('Nirmali');
  const [pincode, setPincode] = useState('847452');
  const [selfDeliveryEnabled, setSelfDeliveryEnabled] = useState(true);
  const [riderDeliveryEnabled, setRiderDeliveryEnabled] = useState(true);
  const [returnPolicyEnabled, setReturnPolicyEnabled] = useState(true);
  const [returnWindowHours, setReturnWindowHours] = useState(24);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [cfg, tpls] = await Promise.allSettled([
          getPublicConfig(),
          apiGetShopCategoryTemplates(),
        ]);
        if (cfg.status === 'fulfilled' && cfg.value && cfg.value.partnerOnboardingEnabled === false) {
          setOnboardingEnabled(false);
        }
        if (tpls.status === 'fulfilled') {
          setTemplates(tpls.value || []);
          if (tpls.value && tpls.value.length > 0) {
            setCategoryTemplateSlug(tpls.value[0].slug || tpls.value[0].categorySlug);
          }
        }
      } catch (_err) {
        // Fallback gracefully
      } finally {
        setConfigLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      setPhone(user.phone ? user.phone.replace(/^\+91/, '') : '');
      setEmail(user.email || '');
      if (user.name) {
        setShopName(`${user.name}'s Shop`);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?redirect=/partner/shop/apply');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please agree to the Lele Shop Merchant Partner Terms.');
      return;
    }

    if (!shopName.trim()) {
      setErrorMsg('Shop name is required.');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Shop address is required.');
      return;
    }

    if (!selfDeliveryEnabled && !riderDeliveryEnabled) {
      setErrorMsg('At least one delivery method (Seller Self-Delivery or LELE Rider Delivery) must be enabled.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await apiApplyShopPartner({
        name: shopName.trim(),
        shopName: shopName.trim(),
        categoryTemplateSlug,
        shopCategory: categoryTemplateSlug,
        description: description.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        location: location.trim() || 'Nirmali Bazar',
        city: city.trim() || 'Nirmali',
        pincode: pincode.trim(),
        selfDeliveryEnabled,
        riderDeliveryEnabled,
        returnPolicyEnabled,
        returnWindowHours: Number(returnWindowHours) || 24,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Shop application error:', err);
      if (err?.code === 'ONBOARDING_DISABLED') {
        setOnboardingEnabled(false);
      }
      setErrorMsg(err?.message || 'Failed to submit shop application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (configLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Checking onboarding eligibility...</p>
        </div>
      </div>
    );
  }

  // Already Approved Shop
  if (isShopApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Already Registered!</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your account is already an approved Shop Partner. You can manage your products, variants, inventory, and orders from your partner console.
          </p>
          <div className="pt-2">
            <Link
              href="/partner/shop"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>Launch Shop Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pending Shop Application
  if (isShopPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Application Under Review</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            You already have a pending Shop partner application under review. Our merchant onboarding team is verifying your details.
          </p>
          <div className="pt-2">
            <Link
              href="/partner/shop"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>Check Application Status</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Single-Partner-Role Conflict: Restaurant Partner
  if (isVendorApproved || isVendorPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Restaurant Partner Active</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your account is associated with a restaurant partner or has a pending kitchen application. Per LELE single-partner policy, an account can only be one partner type (Rider, Restaurant, or Shop).
          </p>
          <div className="pt-2">
            <Link
              href="/partner/restaurant"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>Go to Restaurant Console</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Single-Partner-Role Conflict: Rider Partner
  if (isRiderApproved || isRiderPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Bike className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Rider Account Active</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your account is registered with the delivery fleet or has a pending application. Per LELE single-partner policy, an account can only be one partner type (Rider, Restaurant, or Shop).
          </p>
          <div className="pt-2">
            <Link
              href="/partner/rider"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>Go to Rider Console</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!onboardingEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Onboarding Temporarily Closed</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            New partner registrations are currently paused. If you already have an active profile or pending review, our team is processing it.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Application Submitted!</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Thank you for applying to sell on LELE Shop. Our onboarding team will verify your shop information and review your application shortly.
          </p>
          <div className="pt-2">
            <Link
              href="/partner/shop"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>View Application Status</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Partner Tracks</span>
          </Link>
        </div>

        {/* Header Hero */}
        <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-200 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Multi-Vendor Commerce</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Become a LELE Shop Partner
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              Sell clothing, books, electronics, grocery, stationery, and gifts to thousands of local customers in Nirmali. Control variants, inventory, and choose between Seller Self-Delivery or LELE Rider Delivery.
            </p>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Shop Details */}
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600" />
                <span>Shop Identity</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Shop / Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Nirmali Fashion Hub, Gupta Electronics"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Primary Shop Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryTemplateSlug}
                    onChange={(e) => setCategoryTemplateSlug(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {templates.map((tpl) => {
                      const slug = tpl.slug || tpl.categorySlug;
                      return (
                        <option key={tpl.id || slug} value={slug}>
                          {tpl.name}
                        </option>
                      );
                    })}
                    {templates.length === 0 && (
                      <>
                        <option value="clothing">Clothing & Apparel</option>
                        <option value="books">Books & Stationery</option>
                        <option value="electronics">Electronics & Gadgets</option>
                        <option value="grocery">Grocery & Daily Needs</option>
                        <option value="stationery">Stationery & Office</option>
                        <option value="gifts">Gifts & Lifestyle</option>
                        <option value="general">General Store</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 rounded-r-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Description / About Shop
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of what your shop offers..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600" />
                <span>Store Location & Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop No. 12, Main Market Road"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Locality / Bazar
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Nirmali Bazar"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Nirmali"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="847452"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery & Return Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600" />
                <span>Delivery & Return Options</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 hover:border-purple-300 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selfDeliveryEnabled}
                    onChange={(e) => setSelfDeliveryEnabled(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Seller Self-Delivery</span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      Your store delivers directly to local customers with your own staff.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 hover:border-purple-300 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riderDeliveryEnabled}
                    onChange={(e) => setRiderDeliveryEnabled(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900">LELE Rider Fleet Delivery</span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      LELE delivery riders pick up from your store and deliver to customers.
                    </span>
                  </div>
                </label>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 bg-purple-50/40 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={returnPolicyEnabled}
                    onChange={(e) => setReturnPolicyEnabled(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                      <span>Enable Customer Returns & Exchanges</span>
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      Allows customers to request return or size/variant exchange within the configured return window.
                    </span>
                  </div>
                </label>

                {returnPolicyEnabled && (
                  <div className="pl-7 flex items-center gap-3 pt-2">
                    <span className="text-xs font-bold text-gray-700">Return Window:</span>
                    <select
                      value={returnWindowHours}
                      onChange={(e) => setReturnWindowHours(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold bg-white"
                    >
                      <option value={12}>12 Hours</option>
                      <option value={24}>24 Hours (Recommended)</option>
                      <option value={48}>48 Hours</option>
                      <option value={72}>72 Hours</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded mt-0.5"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I agree to the LELE Shop Partner Terms & Conditions and confirm that I am authorized to sell genuine products for this business. I understand that each account may only hold one partner role (Rider, Restaurant, or Shop).
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Submit Shop Partner Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
