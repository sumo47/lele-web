'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Search,
  RefreshCw,
  Bike,
  Wallet,
  Calendar,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { apiGetRiderOrders } from '@/lib/api';
import type { RiderOrder } from '@/lib/types';

export default function RiderHistoryPage() {
  return (
    <PartnerRouteGuard role="rider">
      <RiderHistoryContent />
    </PartnerRouteGuard>
  );
}

function RiderHistoryContent() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const fetchHistory = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiGetRiderOrders({ limit: 100 });
      setOrders(res.data || []);
    } catch (err: any) {
      console.error('Failed to load rider history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter === 'completed') {
        if (o.status !== 'delivered' && o.status !== 'completed') return false;
      } else if (statusFilter === 'cancelled') {
        if (o.status !== 'cancelled') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = o.id.toLowerCase().includes(q);
        const restMatch = o.restaurant?.name?.toLowerCase().includes(q);
        const custMatch = o.customer?.name?.toLowerCase().includes(q);
        if (!idMatch && !restMatch && !custMatch) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const completedTrips = orders.filter((o) => o.status === 'delivered' || o.status === 'completed');
  const totalEarnings = completedTrips.reduce((sum, o) => sum + (Number(o.riderPayout) || 40), 0);

  return (
    <PartnerLayout
      role="rider"
      title="Trip & Delivery History"
      subtitle="Complete chronological record of all completed customer deliveries and trip earnings."
      actions={
        <button
          onClick={() => fetchHistory(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total Recorded Trips
            </span>
            <div className="text-2xl font-black text-gray-900 mt-1">{orders.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Completed Deliveries
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{completedTrips.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Trip Payouts Total
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalEarnings}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500'
            }`}
          >
            All Trips ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-white shadow-2xs text-emerald-700'
                : 'text-gray-500'
            }`}
          >
            Delivered ({completedTrips.length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'cancelled' ? 'bg-white shadow-2xs text-red-700' : 'text-gray-500'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, restaurant..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" />
            <p className="text-sm font-semibold text-gray-600">Loading delivery history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Bike className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h4 className="text-sm font-bold text-gray-700">No Historical Deliveries</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Deliveries fulfilled by your account will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Trip # & Time</th>
                  <th className="py-3 px-4">Restaurant Pickup</th>
                  <th className="py-3 px-4">Customer Dropoff</th>
                  <th className="py-3 px-4 text-right">Rider Payout</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === 'delivered' || order.status === 'completed';
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-gray-900 block">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-gray-400 font-normal">
                          {new Date(order.timestamps?.createdAt || Date.now()).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-900">
                        <span className="font-bold block">{order.restaurant?.name || 'Restaurant'}</span>
                        <span className="text-[11px] text-gray-500 block truncate max-w-xs">
                          {order.restaurant?.address || 'Nirmali'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-900">
                        <span className="font-semibold block">{order.customer?.name}</span>
                        <span className="text-[11px] text-gray-500 block truncate max-w-xs">
                          {order.customer?.deliveryAddress}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-700">
                        {isDelivered ? `+₹${order.riderPayout || 40}` : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
