'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPublicConfig, applyRiderPartner } from '@/lib/api';
import {
  Bike,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  User,
  Lock,
  Clock,
  Store,
  ShoppingBag,
} from 'lucide-react';

export default function BecomeRiderPage() {
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
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Nirmali');
  const [pincode, setPincode] = useState('847452');
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [idProofType, setIdProofType] = useState('aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [idProofUrl, setIdProofUrl] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');
  const [vehicleRcUrl, setVehicleRcUrl] = useState('');
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
      setFullName(user.name || '');
      setPhone(user.phone ? user.phone.replace(/^\+91/, '') : '');
    }
  }, [user]);

  const isMotorized = ['bike', 'scooter', 'ev'].includes(vehicleType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?redirect=/partner/rider/apply');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please agree to the Lele Delivery & Safety Partner Terms.');
      return;
    }

    if (isMotorized) {
      if (!licenseNumber.trim()) {
        setErrorMsg('Driving licence number is required for motorized vehicles.');
        return;
      }
      if (!licenseExpiry.trim()) {
        setErrorMsg('Driving licence expiry date is required.');
        return;
      }
      const expDate = new Date(licenseExpiry.trim());
      if (isNaN(expDate.getTime()) || expDate <= new Date()) {
        setErrorMsg('Driving licence must be valid and not expired.');
        return;
      }
      if (!licenseUrl.trim()) {
        setErrorMsg('Driving licence photo / document URL is required.');
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await applyRiderPartner({
        partnerType: 'rider',
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim() || 'Nirmali',
        pincode: pincode.trim(),
        vehicleType,
        vehicleNumber: isMotorized ? vehicleNumber.trim() : undefined,
        idProofType,
        idProofNumber: idProofNumber.trim(),
        idProofUrl: idProofUrl.trim() || undefined,
        licenseNumber: isMotorized ? licenseNumber.trim() : undefined,
        licenseExpiry: isMotorized ? licenseExpiry.trim() : undefined,
        licenseUrl: isMotorized ? licenseUrl.trim() : undefined,
        vehicleRcUrl: isMotorized ? vehicleRcUrl.trim() || undefined : undefined,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Rider application error:', err);
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

  if (isRiderApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Bike className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Already Registered!</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your account is already an approved Delivery Partner. You can view broadcast orders, active trips, and track your wallet payouts from your rider console.
          </p>
          <div className="pt-2">
            <Link
              href="/partner/rider"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>Launch Rider Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isRiderPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Application Under Review</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            You already have a pending delivery fleet application under review. Our operations team is inspecting your driving licence and vehicle records.
          </p>
          <div className="pt-2">
            <Link
              href="/partner/rider"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <span>Check Application Status</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isVendorApproved || isVendorPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Restaurant Partner Active</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your account is associated with a restaurant partner or has a pending kitchen application. Per LELE policy, an account can be Customer+Rider OR Customer+Shop Owner.
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
            Thank you, <strong className="text-gray-900">{fullName}</strong>! Your application to become a Lele Delivery Rider has been received. Our team will verify your documents within 24–48 hours.
          </p>
          <div className="space-y-3">
            <Link
              href="/partner/rider"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition"
            >
              Go to Rider Dashboard
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
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Become a Lele Rider</h1>
              <p className="text-xs sm:text-sm text-gray-500">Deliver food & essentials in Nirmali and earn ₹300–₹800 daily</p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-center justify-between gap-3">
              <span>Already have a customer account? Please sign in first so we link your partner profile.</span>
              <Link
                href="/login?redirect=/partner/rider/apply"
                className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shrink-0"
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
                <User className="w-4 h-4" /> 1. Personal Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Residential Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No, Ward, Landmark, Locality"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">City / Town *</label>
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
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Bike className="w-4 h-4" /> 2. Delivery Vehicle Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vehicle Type *</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  >
                    <option value="bike">Motorcycle / Bike (Motorized)</option>
                    <option value="scooter">Scooter (Motorized)</option>
                    <option value="ev">Electric Two-Wheeler (Motorized)</option>
                    <option value="cycle">Bicycle (Non-Motorized)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Vehicle Number {isMotorized ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="text"
                    required={isMotorized}
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. BR-50-AB-1234"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
              </div>

              {isMotorized && (
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Statutory Driving Licence Requirements
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Driving Licence No. *</label>
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. BR-50-20220012345"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">DL Expiry Date * (Future)</label>
                      <input
                        type="date"
                        required
                        value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">DL Document / Photo URL *</label>
                    <input
                      type="url"
                      required
                      value={licenseUrl}
                      onChange={(e) => setLicenseUrl(e.target.value)}
                      placeholder="https://.../dl_photo.jpg"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}
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
                  I declare that the information provided is accurate and authentic. I agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-red-600 font-semibold underline">
                    Lele Rider Partner Agreement
                  </Link>{' '}
                  and road safety standards.
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
                  'Submit Rider Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
