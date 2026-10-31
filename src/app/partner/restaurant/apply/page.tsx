'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPublicConfig, applyRestaurantPartner } from '@/lib/api';
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Lock,
  Clock,
  Bike,
  ShoppingBag,
} from 'lucide-react';

export default function BecomeRestaurantPage() {
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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [restaurantName, setRestaurantName] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('Nirmali Bazar');
  const [city, setCity] = useState('Nirmali');
  const [pincode, setPincode] = useState('847452');
  const [cuisines, setCuisines] = useState('North Indian, Fast Food, Snacks');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [fssaiCertificateDocUrl, setFssaiCertificateDocUrl] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    async function checkConfig() {
      try {
        const cfg = await getPublicConfig();
        if (cfg && cfg.partnerOnboardingEnabled === false) {
          setOnboardingEnabled(false);
        }
      } catch (_err) {
        // Fallback safely to current state
      } finally {
        setConfigLoading(false);
      }
    }
    checkConfig();
  }, []);

  useEffect(() => {
    if (user) {
      setPhone(user.phone ? user.phone.replace(/^\+91/, '') : '');
      setEmail(user.email || '');
      if (user.name) {
        setRestaurantName(`${user.name} Kitchen`);
      }
    }
  }, [user]);

  const isFoodBusiness = ['restaurant', 'bakery', 'cafe'].includes(businessType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?redirect=/partner/restaurant/apply');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please agree to the Lele Merchant & Restaurant Partner Terms.');
      return;
    }

    if (isFoodBusiness) {
      if (!fssaiNumber.trim() || fssaiNumber.trim().length !== 14) {
        setErrorMsg('Valid 14-digit FSSAI licence/registration number is required for food businesses.');
        return;
      }
      if (!fssaiCertificateDocUrl.trim()) {
        setErrorMsg('FSSAI Certificate document / image URL is required.');
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await applyRestaurantPartner({
        partnerType: 'vendor',
        restaurantName: restaurantName.trim(),
        name: restaurantName.trim(),
        businessType,
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        location: location.trim() || 'Nirmali Bazar',
        city: city.trim() || 'Nirmali',
        pincode: pincode.trim(),
        cuisines: cuisines.split(',').map((c) => c.trim()).filter(Boolean),
        fssaiNumber: isFoodBusiness ? fssaiNumber.trim() : undefined,
        fssaiCertificateDocUrl: isFoodBusiness ? fssaiCertificateDocUrl.trim() : undefined,
        gstNumber: gstNumber.trim() || undefined,
        panNumber: panNumber.trim() || undefined,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Restaurant application error:', err);
      if (err?.code === 'ONBOARDING_DISABLED') {
        setOnboardingEnabled(false);
      }
      setErrorMsg(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (configLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Checking onboarding eligibility...</p>
        </div>
      </div>
    );
  }

  if (isVendorApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Already Registered!</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your account is already an approved Restaurant Partner. You can manage live kitchen orders, menus, and financial reports from your partner console.
          </p>
          <div className="pt-2">
            <Link
              href="/partner/restaurant"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>Launch Restaurant Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isVendorPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Application Under Review</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            You already have a pending restaurant partner application under review. Our merchant onboarding team is verifying your details and credentials.
          </p>
          <div className="pt-2">
            <Link
              href="/partner/restaurant"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>Check Application Status</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isRiderApproved || isRiderPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Bike className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Rider Account Active</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your account is registered with the delivery fleet or has a pending application. Per LELE policy, an account can be Customer+Rider OR Customer+Shop Owner.
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

  if (isShopApproved || isShopPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Shop Partner Active</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your account is associated with a Shop seller account or has a pending shop application. Per LELE single-partner policy, an account can only be one partner type (Rider, Restaurant, or Shop).
          </p>
          <div className="pt-2">
            <Link
              href="/partner/shop"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>Go to Shop Console</span>
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
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted! 🎉</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Congratulations, <strong className="text-gray-900">{restaurantName}</strong>! Your restaurant application has been submitted. Our merchant operations team will inspect your details and activate your digital storefront.
          </p>
          <div className="space-y-3">
            <Link
              href="/partner/restaurant"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition"
            >
              Go to Restaurant Dashboard
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Partner with Lele Store</h1>
              <p className="text-xs sm:text-sm text-gray-500">Sell food, bakery, or groceries online to thousands of Nirmali customers</p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="p-3.5 bg-orange-50/70 border border-orange-100 rounded-xl text-xs text-orange-900 flex items-center justify-between gap-3">
              <span>Please sign in with your customer account so we can link your store ownership.</span>
              <Link
                href="/login?redirect=/partner/restaurant/apply"
                className="px-3 py-1 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition shrink-0"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Store className="w-4 h-4" /> 1. Store / Restaurant Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Establishment Name *</label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. Royal Kitchen & Sweets"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Category *</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  >
                    <option value="restaurant">Restaurant / Dhaba</option>
                    <option value="bakery">Bakery & Sweets</option>
                    <option value="grocery">Grocery & Daily Essentials</option>
                    <option value="cafe">Cafe & Quick Bites</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Store Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Store Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="store@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Shop Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Market Road, Shop No, Landmark"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Locality / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Specialty Cuisines / Categories</label>
                <input
                  type="text"
                  value={cuisines}
                  onChange={(e) => setCuisines(e.target.value)}
                  placeholder="e.g. Biryani, North Indian, Fast Food, Sweets"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                />
              </div>
            </div>

            {isFoodBusiness && (
              <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-4">
                <div className="text-xs font-bold text-orange-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" /> Food Safety (FSSAI) Statutory Requirements
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">14-Digit FSSAI Number *</label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      value={fssaiNumber}
                      onChange={(e) => setFssaiNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="14-digit FSSAI number"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">FSSAI Certificate Doc URL *</label>
                    <input
                      type="url"
                      required
                      value={fssaiCertificateDocUrl}
                      onChange={(e) => setFssaiCertificateDocUrl(e.target.value)}
                      placeholder="https://.../fssai_cert.pdf"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 2. Tax & Legal (Optional)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="15-character GST number"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">PAN Number (Optional)</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="10-character PAN number"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-600 leading-relaxed">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span>
                  I declare that the establishment details and certificates submitted are genuine. I agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-red-600 font-semibold underline">
                    Lele Store Merchant Partner Agreement
                  </Link>{' '}
                  and platform hygiene guidelines.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !isAuthenticated}
                className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...
                  </>
                ) : (
                  'Submit Restaurant / Shop Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
