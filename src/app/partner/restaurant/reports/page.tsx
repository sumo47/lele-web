'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Percent,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  RefreshCw,
  Wallet,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import { apiGetVendorOrders, apiGetVendorOutlet } from '@/lib/api';
import type { VendorOrder, VendorOutlet } from '@/lib/types';

export default function RestaurantReportsPage() {
  return (
    <PartnerRouteGuard role="vendor">
      <RestaurantReportsContent />
    </PartnerRouteGuard>
  );
}

type DateRange = 'today' | '7days' | '30days' | 'all';

function RestaurantReportsContent() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [outlet, setOutlet] = useState<VendorOutlet | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30days');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [ordersRes, outletRes] = await Promise.allSettled([
        apiGetVendorOrders({ limit: 100 }),
        apiGetVendorOutlet(),
      ]);

      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value.data || []);
      }
      if (outletRes.status === 'fulfilled') {
        setOutlet(outletRes.value);
      }
    } catch (err: any) {
      console.error('Failed to load sales report data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.timestamps?.createdAt || Date.now());
      if (dateRange === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateRange === '7days') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (dateRange === '30days') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      return true;
    });
  }, [orders, dateRange]);

  // Compute Authoritative Financials
  const commissionRate = outlet?.commissionRate ? Number(outlet.commissionRate) : 12.0;

  const completedOrders = filteredOrders.filter(
    (o) => o.status === 'delivered' || o.status === 'completed'
  );
  const cancelledOrders = filteredOrders.filter(
    (o) => o.status === 'cancelled' || o.status === 'rejected'
  );

  const grossSales = completedOrders.reduce(
    (sum, o) => sum + (Number(o.pricing?.total) || 0),
    0
  );
  const estimatedCommission = (grossSales * commissionRate) / 100;
  const netEarnings = grossSales - estimatedCommission;

  const fulfillmentRate =
    filteredOrders.length > 0
      ? Math.round((completedOrders.length / filteredOrders.length) * 100)
      : 100;

  return (
    <PartnerLayout
      role="restaurant"
      title="Sales & Financial Performance"
      subtitle="Authoritative financial breakdown of gross order value, platform commission, and net earnings."
      actions={
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-2xs text-xs font-bold">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                onClick={() => setDateRange(d.id)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  dateRange === d.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 transition cursor-pointer"
            title="Refresh Report"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-red-600' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Financial Disclaimer Banner */}
      <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Transparent Accounting Notice:</span>
          <p className="text-gray-600 leading-relaxed">
            <strong>Gross Order Value (GOV)</strong> represents total customer payments. <strong>Net Earnings</strong> represents gross order value minus platform service commissions ({commissionRate}%). Platform disbursements are processed to your registered merchant bank account.
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Gross Sales */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Gross Sales (GOV)
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              ₹{Math.round(grossSales).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Across {completedOrders.length} fulfilled orders
            </p>
          </div>
        </div>

        {/* Platform Commission */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Platform Fee ({commissionRate}%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-900">
              ₹{Math.round(estimatedCommission).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Service & delivery dispatch fee</p>
          </div>
        </div>

        {/* Net Partner Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Net Payout Earnings
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              ₹{Math.round(netEarnings).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Net receivable by restaurant</p>
          </div>
        </div>

        {/* Fulfillment Rate */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Fulfillment Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              {fulfillmentRate}%
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {cancelledOrders.length} cancelled order(s)
            </p>
          </div>
        </div>
      </div>

      {/* Orders Performance Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Order Transactions</h3>
            <p className="text-xs text-gray-500">
              Showing {filteredOrders.length} order(s) in selected timeframe
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
            <p className="text-sm font-semibold text-gray-600">Calculating financial metrics...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h4 className="text-sm font-bold text-gray-700">No Orders in this Timeframe</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Select a broader date range to review historical order sales.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Gross Total</th>
                  <th className="py-3 px-4 text-right">Comm. ({commissionRate}%)</th>
                  <th className="py-3 px-4 text-right">Net Earning</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((order) => {
                  const gross = Number(order.pricing?.total) || 0;
                  const comm = (gross * commissionRate) / 100;
                  const net = gross - comm;
                  const isDelivered =
                    order.status === 'delivered' || order.status === 'completed';
                  const isCancelled =
                    order.status === 'cancelled' || order.status === 'rejected';

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

                      <td className="py-3.5 px-4 text-gray-800">
                        <span className="font-semibold block">{order.customer?.name}</span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {order.payment?.method || 'COD'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-gray-900 font-mono">
                        ₹{Math.round(gross)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-amber-700 font-mono">
                        {isDelivered ? `-₹${Math.round(comm)}` : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-700">
                        {isDelivered ? `₹${Math.round(net)}` : isCancelled ? '₹0' : 'Pending'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-red-100 text-red-800'
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
