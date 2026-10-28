'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Power,
  Store,
  UtensilsCrossed,
  ArrowRight,
  RefreshCw,
  Eye,
  ChefHat,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetVendorOrders,
  apiGetVendorOutlet,
  apiUpdateVendorOutletStatus,
  apiAcceptVendorOrder,
  apiUpdateVendorOrderStatus,
} from '@/lib/api';
import type { VendorOrder, VendorOutlet } from '@/lib/types';

export default function RestaurantOverviewPage() {
  return (
    <PartnerRouteGuard role="vendor">
      <RestaurantOverviewContent />
    </PartnerRouteGuard>
  );
}

function RestaurantOverviewContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [outlet, setOutlet] = useState<VendorOutlet | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [ordersRes, outletRes] = await Promise.allSettled([
        apiGetVendorOrders({ limit: 15 }),
        apiGetVendorOutlet(),
      ]);

      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value.data || []);
      }
      if (outletRes.status === 'fulfilled') {
        setOutlet(outletRes.value);
      }
    } catch (err: any) {
      console.error('Failed to load restaurant dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleToggleOnline = async () => {
    if (!outlet) return;
    const nextStatus = !outlet.isOnline;
    setTogglingStatus(true);
    setFeedbackMsg(null);

    try {
      const res = await apiUpdateVendorOutletStatus(nextStatus, outlet.id);
      setOutlet((prev) => (prev ? { ...prev, isOnline: res.isOnline, isOpen: res.isOpen } : null));
      setFeedbackMsg({
        type: 'success',
        text: `Kitchen outlet is now ${nextStatus ? 'ONLINE & accepting orders' : 'OFFLINE (orders paused)'}`,
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.message || 'Failed to update kitchen status. Please try again.',
      });
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleQuickAccept = async (orderId: string) => {
    try {
      await apiAcceptVendorOrder(orderId, 20);
      setFeedbackMsg({ type: 'success', text: `Order accepted! Added to active preparation.` });
      await loadDashboardData(true);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to accept order.' });
    }
  };

  const handleQuickReady = async (orderId: string) => {
    try {
      await apiUpdateVendorOrderStatus(orderId, 'ready');
      setFeedbackMsg({ type: 'success', text: `Order marked READY for rider pickup!` });
      await loadDashboardData(true);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to mark order ready.' });
    }
  };

  // Metrics computation from real authoritative orders
  const pendingOrders = orders.filter((o) => o.status === 'ordered' || o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready' || o.status === 'dispatched' || o.status === 'on_the_way');
  const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.pricing?.total) || 0), 0);

  return (
    <PartnerLayout
      role="restaurant"
      title={outlet?.name || user?.restaurantName || 'Restaurant Overview'}
      subtitle={`Welcome back, ${user?.name || 'Chef'}. Manage your kitchen orders, dishes, and outlet status.`}
      actions={
        <div className="flex items-center gap-3">
          {/* Outlet Online/Offline Toggle */}
          {outlet && (
            <button
              onClick={handleToggleOnline}
              disabled={togglingStatus}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                outlet.isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } disabled:opacity-60 cursor-pointer`}
            >
              <Power className={`w-3.5 h-3.5 ${outlet.isOnline ? 'text-white' : 'text-gray-500'}`} />
              <span>{outlet.isOnline ? 'Outlet Online' : 'Outlet Offline'}</span>
            </button>
          )}

          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 transition"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs text-gray-400 hover:text-gray-600 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Pending Orders Card */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              New / Pending
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900">{pendingOrders.length}</div>
            <p className="text-xs text-gray-500 mt-0.5">Orders awaiting acceptance</p>
          </div>
        </div>

        {/* Preparing Card */}
        <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Cooking Now
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900">{preparingOrders.length}</div>
            <p className="text-xs text-gray-500 mt-0.5">Items in kitchen preparation</p>
          </div>
        </div>

        {/* Ready / Dispatched Card */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Ready for Pickup
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900">{readyOrders.length}</div>
            <p className="text-xs text-gray-500 mt-0.5">Awaiting rider delivery pickup</p>
          </div>
        </div>

        {/* Total Sales Card */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Delivered Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900">
              ₹{Math.round(totalRevenue).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">From {completedOrders.length} completed orders</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/partner/restaurant/orders"
          className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-100">
              Live Kitchen
            </span>
            <h3 className="text-lg font-black mt-1">Manage Orders</h3>
            <p className="text-xs text-red-100 mt-0.5">Accept, prepare & track live kitchen queue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </Link>

        <Link
          href="/partner/restaurant/menu"
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Menu & Catalog
            </span>
            <h3 className="text-lg font-black text-gray-900 mt-1">Edit Dishes & Pricing</h3>
            <p className="text-xs text-gray-500 mt-0.5">Add dishes, toggle in-stock items & photos</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:translate-x-1 transition-transform text-gray-600">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </Link>

        <Link
          href="/partner/restaurant/reports"
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Performance
            </span>
            <h3 className="text-lg font-black text-gray-900 mt-1">Sales & Earnings</h3>
            <p className="text-xs text-gray-500 mt-0.5">Track daily order volume & revenue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:translate-x-1 transition-transform text-gray-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Live Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Kitchen Orders</h2>
            <p className="text-xs text-gray-500">Live order stream updated from backend</p>
          </div>
          <Link
            href="/partner/restaurant/orders"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            View All ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
            <p className="text-xs font-medium">Loading live kitchen orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm font-bold text-gray-700">No Orders Yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              New customer orders placed for your kitchen will appear here automatically in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 5).map((order) => {
              const isPending = order.status === 'ordered' || order.status === 'pending';
              const isPreparing = order.status === 'preparing';

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 hover:bg-gray-50/80 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          order.status === 'ordered' || order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'preparing'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'ready'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'delivered' || order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.timestamps?.createdAt || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-gray-700 font-medium">
                      Customer:{' '}
                      <strong className="text-gray-900">{order.customer?.name || 'Customer'}</strong>
                      {order.customer?.phone && ` (${order.customer.phone})`}
                    </div>

                    {/* Order Items Snippet */}
                    <div className="text-xs text-gray-500 truncate">
                      {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ') || 'No item details'}
                    </div>

                    {order.cookingInstructions && (
                      <div className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md inline-block">
                        Note: &ldquo;{order.cookingInstructions}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right sm:mr-2">
                      <div className="text-base font-black text-gray-900">
                        ₹{Math.round(order.pricing?.total || 0)}
                      </div>
                      <div className="text-[11px] text-gray-400 uppercase">
                        {order.payment?.method || 'COD'}
                      </div>
                    </div>

                    {isPending && (
                      <button
                        onClick={() => handleQuickAccept(order.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-xs"
                      >
                        Accept (20m)
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleQuickReady(order.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-xs"
                      >
                        Mark Ready
                      </button>
                    )}

                    <Link
                      href={`/partner/restaurant/orders?orderId=${order.id}`}
                      className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
