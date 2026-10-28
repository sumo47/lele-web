'use client';

import React, { useEffect, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { apiGetRiderOrders, apiGetRiderProfile } from '@/lib/api';
import type { RiderOrder, RiderProfile } from '@/lib/types';

export default function RiderEarningsPage() {
  return (
    <PartnerRouteGuard role="rider">
      <RiderEarningsContent />
    </PartnerRouteGuard>
  );
}

function RiderEarningsContent() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [profile, setProfile] = useState<RiderProfile | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [ordersRes, profileRes] = await Promise.allSettled([
        apiGetRiderOrders({ limit: 50 }),
        apiGetRiderProfile(),
      ]);

      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value.data || []);
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
      }
    } catch (err: any) {
      console.error('Failed to load rider earnings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const completedTrips = orders.filter((o) => o.status === 'delivered' || o.status === 'completed');
  const earnedPayoutTotal = completedTrips.reduce((sum, o) => sum + (Number(o.riderPayout) || 40), 0);
  const codCollectedTotal = completedTrips
    .filter((o) => o.payment?.method === 'COD')
    .reduce((sum, o) => sum + (Number(o.pricing?.total) || 0), 0);

  return (
    <PartnerLayout
      role="rider"
      title="Rider Wallet & Payout Earnings"
      subtitle="Authoritative wallet balance, trip earnings, and cash on delivery reconciliation."
      actions={
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Information Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs text-emerald-950">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Transparent Delivery Earnings:</span>
          <p className="text-gray-600 leading-relaxed">
            Riders receive guaranteed <strong>₹40 base delivery fee</strong> per successfully fulfilled order. Cash on Delivery (COD) collected in cash is reconciled against your delivery earnings ledger.
          </p>
        </div>
      </div>

      {/* Main Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Wallet Balance */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Withdrawable Wallet Balance
            </span>
            <Wallet className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="text-3xl sm:text-4xl font-black">
            ₹{Math.round(profile?.walletBalance || earnedPayoutTotal).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-100/90 font-medium pt-1">
            Settled via Direct Bank Transfer or UPI
          </p>
        </div>

        {/* Total Delivery Payouts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Trip Earnings (Completed)
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">
            ₹{earnedPayoutTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-gray-500 font-medium pt-1">
            From {completedTrips.length} completed drop-offs
          </p>
        </div>

        {/* COD Cash Collected */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              COD Cash in Hand
            </span>
            <Banknote className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">
            ₹{Math.round(codCollectedTotal).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-gray-500 font-medium pt-1">
            Cash collected from customers
          </p>
        </div>
      </div>

      {/* Ledger Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Recent Delivery Ledger</h3>
          <span className="text-xs text-gray-500">{completedTrips.length} settled trips</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" />
            <p className="text-sm font-semibold text-gray-600">Loading ledger data...</p>
          </div>
        ) : completedTrips.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h4 className="text-sm font-bold text-gray-700">No Settled Trips Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Complete assigned deliveries to see trip payouts credited to your ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Trip Details</th>
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Order Amount</th>
                  <th className="py-3 px-4 text-right">Rider Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {completedTrips.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-gray-900 block">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-gray-400 font-normal">
                        {new Date(order.timestamps?.createdAt || Date.now()).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {order.restaurant?.name || 'Restaurant'}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700">
                      {order.customer?.name}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-900">
                      ₹{Math.round(order.pricing?.total || 0)} ({order.payment?.method || 'COD'})
                    </td>

                    <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-700">
                      +₹{order.riderPayout || 40}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
