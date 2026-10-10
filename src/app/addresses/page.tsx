'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  apiGetAddresses,
  apiCreateAddress,
  apiDeleteAddress,
  apiSetDefaultAddress,
} from '@/lib/api';
import type { CustomerAddress } from '@/lib/types';
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  ChevronLeft,
  Home,
  Briefcase,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function AddressesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [title, setTitle] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Nirmali');
  const [postalCode, setPostalCode] = useState('847452');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/addresses');
      return;
    }
    if (user) {
      loadAddresses();
    }
  }, [user, authLoading, router]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await apiGetAddresses();
      setAddresses(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim()) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      await apiCreateAddress({
        title,
        addressLine,
        landmark,
        city,
        postalCode,
        isDefault,
      });
      // Reset form
      setShowAddForm(false);
      setAddressLine('');
      setLandmark('');
      setIsDefault(false);
      await loadAddresses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiSetDefaultAddress(id);
      await loadAddresses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to set default address');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await apiDeleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete address');
    }
  };

  if (authLoading || (loading && !addresses.length)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#E23744] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Account
          </Link>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E23744] hover:bg-[#d02835] text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your delivery locations in Nirmali & surrounding areas
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 text-red-800 text-sm flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Add Address Form Accordion */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Delivery Address</h2>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Address Label
                </label>
                <div className="flex gap-3">
                  {['Home', 'Work', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTitle(t)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                        title === t
                          ? 'border-[#E23744] bg-red-50 text-[#E23744]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Complete Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="House/Flat No., Building Name, Street / Mohalla"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Station / Market"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#E23744] rounded border-gray-300 focus:ring-[#E23744]"
                />
                <span className="text-xs font-medium text-gray-700">
                  Set as default delivery address
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#E23744] hover:bg-[#d02835] text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Address
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">No saved addresses yet</h3>
            <p className="text-xs text-gray-500 mb-5">
              Add your home or office address to enable instant checkout.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E23744] text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-[#d02835] transition"
            >
              <Plus className="w-4 h-4" />
              Add First Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl p-5 border transition ${
                  addr.isDefault
                    ? 'border-[#E23744] shadow-sm ring-1 ring-[#E23744]/20'
                    : 'border-gray-100 shadow-xs hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                      {addr.title?.toLowerCase() === 'work' ? (
                        <Briefcase className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Home className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm">{addr.title || 'Address'}</h3>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#E23744] border border-red-200">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{addr.addressLine}</p>
                      {addr.landmark && (
                        <p className="text-xs text-gray-500 mt-0.5">Landmark: {addr.landmark}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {addr.city || 'Nirmali'}{addr.postalCode ? ` - ${addr.postalCode}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
