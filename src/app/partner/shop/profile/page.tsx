'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Truck,
  RotateCcw,
  MapPin,
  Phone,
  Mail,
  Power,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetMyShopProfile,
  apiUpdateMyShopProfile,
} from '@/lib/api';
import type { ShopProfile } from '@/lib/types';

export default function ShopProfilePage() {
  return (
    <PartnerRouteGuard role="shop">
      <ShopProfileContent />
    </PartnerRouteGuard>
  );
}

function ShopProfileContent() {
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [selfDeliveryEnabled, setSelfDeliveryEnabled] = useState(true);
  const [riderDeliveryEnabled, setRiderDeliveryEnabled] = useState(true);
  const [returnPolicyEnabled, setReturnPolicyEnabled] = useState(true);
  const [returnWindowHours, setReturnWindowHours] = useState(24);

  useEffect(() => {
    async function load() {
      try {
        const p = await apiGetMyShopProfile();
        setProfile(p);
        setName(p.name);
        setDescription(p.description || '');
        setPhone(p.phone ? p.phone.replace(/^\+91/, '') : '');
        setEmail(p.email || '');
        setAddress(p.address || '');
        setLocation(p.location || 'Nirmali Bazar');
        setCity(p.city || 'Nirmali');
        setPincode(p.pincode || '847452');
        setImageUrl(p.imageUrl || '');
        setIsOpen(p.isOpen ?? true);
        setSelfDeliveryEnabled(p.selfDeliveryEnabled ?? true);
        setRiderDeliveryEnabled(p.riderDeliveryEnabled ?? true);
        setReturnPolicyEnabled(p.returnPolicyEnabled ?? true);
        setReturnWindowHours(p.returnWindowHours ?? 24);
      } catch (err: any) {
        setFeedback({ type: 'error', text: err?.message || 'Failed to load shop settings.' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!selfDeliveryEnabled && !riderDeliveryEnabled) {
      setFeedback({
        type: 'error',
        text: 'At least one delivery method (Seller Self-Delivery or LELE Rider Delivery) must be enabled.',
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const updated = await apiUpdateMyShopProfile({
        name: name.trim(),
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        location: location.trim() || undefined,
        city: city.trim() || undefined,
        pincode: pincode.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isOpen,
        selfDeliveryEnabled,
        riderDeliveryEnabled,
        returnPolicyEnabled,
        returnWindowHours: Number(returnWindowHours) || 24,
      });

      setProfile(updated);
      setFeedback({ type: 'success', text: 'Shop settings and profile updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to update shop settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PartnerLayout role="shop" title="Store Settings">
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500">Loading settings...</p>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout
      role="shop"
      title="Store Settings & Profile"
      subtitle="Manage business information, delivery options, and return window"
    >
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        )}

        {/* Operational Status */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Power className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Storefront Availability: {isOpen ? 'OPEN' : 'CLOSED'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isOpen
                  ? 'Your store is active and accepting orders from local customers.'
                  : 'Your storefront is temporarily paused. Customers cannot place new orders.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-purple-600" />
            <span>Store Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                disabled
                value={profile?.categoryTemplateName || profile?.shopCategory || 'General'}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Phone
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-r-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Store Image / Logo URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/logo.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Description / About Shop
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>Store Location & Address</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Locality
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Fulfillment & Returns */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-600" />
            <span>Delivery & Return Policy</span>
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
                  <option value={24}>24 Hours (Authoritative LELE Standard)</option>
                  <option value={48}>48 Hours</option>
                  <option value={72}>72 Hours</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Store Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </PartnerLayout>
  );
}
