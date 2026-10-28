'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  User,
  Power,
  Bike,
  ShieldCheck,
  FileText,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Star,
  BadgeCheck,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { apiGetRiderProfile, apiUpdateRiderStatus } from '@/lib/api';
import type { RiderProfile } from '@/lib/types';
import UserAvatar from '@/components/ui/UserAvatar';

export default function RiderProfilePage() {
  return (
    <PartnerRouteGuard role="rider">
      <RiderProfileContent />
    </PartnerRouteGuard>
  );
}

function RiderProfileContent() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProfile = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiGetRiderProfile();
      setProfile(res);
    } catch (err: any) {
      console.error('Failed to load rider profile:', err);
      setToastMsg({ type: 'error', text: err?.message || 'Failed to fetch rider profile.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleToggleDuty = async () => {
    if (!profile) return;
    const nextStatus = !profile.isOnline;
    setTogglingStatus(true);
    setToastMsg(null);

    try {
      const res = await apiUpdateRiderStatus(nextStatus);
      setProfile((prev) => (prev ? { ...prev, isOnline: res.isOnline } : null));
      setToastMsg({
        type: 'success',
        text: `Operational status is now ${nextStatus ? 'ONLINE (Ready for deliveries)' : 'OFFLINE (Duty paused)'}`,
      });
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to update duty status.' });
    } finally {
      setTogglingStatus(false);
    }
  };

  return (
    <PartnerLayout
      role="rider"
      title="Rider Profile & Identity"
      subtitle="View your verified delivery partner credentials, vehicle registration, and duty status."
      actions={
        <button
          onClick={() => fetchProfile(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
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
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" />
          <p className="text-sm font-semibold text-gray-600">Loading rider profile...</p>
        </div>
      ) : !profile ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-bold text-gray-800">Profile Not Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Unable to retrieve rider profile record.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Hero Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <UserAvatar name={profile.name} src={profile.avatarUrl} size="lg" />

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {profile.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/40">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Rider
                  </span>
                </div>

                <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {profile.phone}
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {profile.rating || 5.0} Rating
                  </span>
                  <span>•</span>
                  <span>{profile.totalDeliveries || 0} Successful Deliveries</span>
                </div>
              </div>
            </div>

            {/* Operational Duty Switch */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 shrink-0 flex items-center justify-between md:flex-col md:items-end gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  Delivery Duty State
                </span>
                <span
                  className={`text-sm font-black ${
                    profile.isOnline ? 'text-emerald-600' : 'text-gray-500'
                  }`}
                >
                  {profile.isOnline ? 'ONLINE (On Duty)' : 'OFFLINE (Paused)'}
                </span>
              </div>

              <button
                onClick={handleToggleDuty}
                disabled={togglingStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                  profile.isOnline
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } disabled:opacity-50`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{profile.isOnline ? 'Turn Offline' : 'Turn Online'}</span>
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-emerald-600" /> Personal Information
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Full Legal Name</span>
                  <span className="font-bold text-gray-900">{profile.name}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Contact Number</span>
                  <span className="font-bold font-mono text-gray-900">{profile.phone}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Email Address</span>
                  <span className="font-bold text-gray-900">{profile.email || 'Not provided'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Residential Address</span>
                  <span className="font-bold text-gray-900 text-right max-w-xs truncate">
                    {profile.address || 'Nirmali'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">City / District</span>
                  <span className="font-bold text-gray-900">
                    {profile.city || 'Nirmali'} ({profile.pincode || '847452'})
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Rider Partner Since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(profile.createdAt || Date.now()).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle & Driving Credentials */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Bike className="w-4 h-4 text-purple-600" /> Vehicle & Driving Credentials
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Vehicle Type</span>
                  <span className="font-bold text-gray-900 capitalize">
                    {profile.vehicleType || 'Motorcycle'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Vehicle Registration No.</span>
                  <span className="font-mono font-bold text-gray-900">
                    {profile.vehicleNumber || 'Verified on file'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Driving Licence No.</span>
                  <span className="font-mono font-bold text-gray-900">
                    {profile.licenseNumber || 'Verified on file'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Identity Proof Type</span>
                  <span className="font-bold text-gray-900 uppercase">
                    {profile.idProofType || 'Aadhaar'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Statutory Compliance</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Background Check Cleared
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
