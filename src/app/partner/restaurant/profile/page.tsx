'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Store,
  Power,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Percent,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { apiGetVendorOutlet, apiUpdateVendorOutletStatus } from '@/lib/api';
import type { VendorOutlet } from '@/lib/types';

export default function RestaurantProfilePage() {
  return (
    <PartnerRouteGuard role="vendor">
      <RestaurantProfileContent />
    </PartnerRouteGuard>
  );
}

function RestaurantProfileContent() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [outlet, setOutlet] = useState<VendorOutlet | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOutlet = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiGetVendorOutlet();
      setOutlet(res);
    } catch (err: any) {
      console.error('Failed to load outlet details:', err);
      setToastMsg({ type: 'error', text: err?.message || 'Failed to fetch restaurant profile.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOutlet();
  }, [fetchOutlet]);

  const handleToggleOnline = async () => {
    if (!outlet) return;
    const nextStatus = !outlet.isOnline;
    setTogglingStatus(true);
    setToastMsg(null);

    try {
      const res = await apiUpdateVendorOutletStatus(nextStatus, outlet.id);
      setOutlet((prev) => (prev ? { ...prev, isOnline: res.isOnline, isOpen: res.isOpen } : null));
      setToastMsg({
        type: 'success',
        text: `Kitchen outlet is now ${nextStatus ? 'ONLINE & accepting customer orders' : 'OFFLINE (orders paused)'}`,
      });
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to update outlet status.' });
    } finally {
      setTogglingStatus(false);
    }
  };

  return (
    <PartnerLayout
      role="restaurant"
      title="Outlet Profile & Settings"
      subtitle="View your registered establishment information, statutory certificates, and operational controls."
      actions={
        <button
          onClick={() => fetchOutlet(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-600' : ''}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Toast Feedback */}
      {toastMsg && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="text-xs text-gray-400 hover:text-gray-600 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
          <p className="text-sm font-semibold text-gray-600">Loading outlet profile...</p>
        </div>
      ) : !outlet ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
          <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-bold text-gray-800">Outlet Profile Not Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Unable to retrieve linked outlet information for this vendor account.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Hero Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                {outlet.imageUrl ? (
                  <Image src={outlet.imageUrl} alt={outlet.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Store className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {outlet.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/40">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Partner
                  </span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {outlet.address || `${outlet.location}, ${outlet.city}`}
                </p>
                {outlet.cuisines && outlet.cuisines.length > 0 && (
                  <p className="text-xs text-gray-600 font-medium">
                    Specialties: {outlet.cuisines.join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Duty / Operational Toggle */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 shrink-0 flex items-center justify-between md:flex-col md:items-end gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  Kitchen Operational State
                </span>
                <span
                  className={`text-sm font-black ${
                    outlet.isOnline ? 'text-emerald-600' : 'text-gray-500'
                  }`}
                >
                  {outlet.isOnline ? 'ONLINE (Accepting)' : 'OFFLINE (Paused)'}
                </span>
              </div>

              <button
                onClick={handleToggleOnline}
                disabled={togglingStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                  outlet.isOnline
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } disabled:opacity-50`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{outlet.isOnline ? 'Turn Offline' : 'Turn Online'}</span>
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact & Business Info */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Building className="w-4 h-4 text-red-600" /> Establishment Details
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Business Category</span>
                  <span className="font-bold text-gray-900 capitalize">
                    {outlet.businessType || 'Restaurant'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Registered Owner</span>
                  <span className="font-bold text-gray-900">{outlet.ownerName || 'Verified'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Contact Phone</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {outlet.phone || outlet.ownerPhone || 'Not set'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Contact Email</span>
                  <span className="font-bold text-gray-900">
                    {outlet.email || outlet.ownerEmail || 'Not set'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">City & Postal PIN</span>
                  <span className="font-bold text-gray-900">
                    {outlet.city || 'Nirmali'} - {outlet.pincode || '847452'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Average Preparation Time</span>
                  <span className="font-bold text-gray-900">{outlet.deliveryTime || '25-35 min'}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Platform Commission Rate</span>
                  <span className="font-bold text-gray-900">
                    {outlet.commissionRate ? `${outlet.commissionRate}%` : 'Standard Platform Rate'}
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory Compliance & Tax */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Statutory & Compliance
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-orange-50/60 border border-orange-200/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-900">
                      FSSAI Food Licence
                    </span>
                    <span className="text-[10px] font-bold bg-orange-200 text-orange-950 px-2 py-0.2 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="font-mono font-bold text-sm text-gray-900">
                    {outlet.fssaiNumber || '14-digit FSSAI registered'}
                  </div>
                  {outlet.fssaiCertUrl && (
                    <a
                      href={outlet.fssaiCertUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-700 hover:text-orange-800 underline text-[11px] block mt-1"
                    >
                      View Statutory Certificate →
                    </a>
                  )}
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">GSTIN Identification</span>
                  <span className="font-mono font-bold text-gray-900">
                    {outlet.gstNumber || 'Not Registered / Composite'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">PAN Number</span>
                  <span className="font-mono font-bold text-gray-900">
                    {outlet.panNumber ? `${outlet.panNumber.slice(0, 3)}****${outlet.panNumber.slice(-2)}` : 'On file'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Partner Joined Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(outlet.createdAt || Date.now()).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
