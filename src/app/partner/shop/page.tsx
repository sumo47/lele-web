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
  ChevronRight,
  Sparkles,
  RotateCcw,
  BarChart3,
  Truck,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetMyShopProfile,
  apiUpdateMyShopProfile,
  apiGetMyProducts,
  apiGetMyShopOrders,
  apiGetMyShopReturns,
} from '@/lib/api';
import type { ShopProfile, ShopProduct, Order, ReturnRequest } from '@/lib/types';

export default function ShopOverviewPage() {
  return (
    <PartnerRouteGuard role="shop">
      <ShopOverviewContent />
    </PartnerRouteGuard>
  );
}

function ShopOverviewContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [profRes, prodRes, ordRes, retRes] = await Promise.allSettled([
        apiGetMyShopProfile(),
        apiGetMyProducts(),
        apiGetMyShopOrders(),
        apiGetMyShopReturns(),
      ]);

      if (profRes.status === 'fulfilled') {
        setProfile(profRes.value);
      }
      if (prodRes.status === 'fulfilled') {
        const pVal = prodRes.value;
        setProducts(Array.isArray(pVal) ? pVal : (pVal?.products || []));
      }
      if (ordRes.status === 'fulfilled') {
        const oVal = ordRes.value;
        setOrders(Array.isArray(oVal) ? oVal : (oVal?.orders || []));
      }
      if (retRes.status === 'fulfilled') {
        const rVal = retRes.value;
        setReturns(Array.isArray(rVal) ? rVal : []);
      }
    } catch (err: any) {
      console.error('Failed to load shop dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleToggleStoreOpen = async () => {
    if (!profile) return;
    const nextOpen = !profile.isOpen;
    setTogglingOpen(true);
    setFeedbackMsg(null);

    try {
      const res = await apiUpdateMyShopProfile({ isOpen: nextOpen });
      setProfile((prev) => (prev ? { ...prev, isOpen: res.isOpen } : null));
      setFeedbackMsg({
        type: 'success',
        text: `Shop is now ${nextOpen ? 'OPEN & accepting customer orders' : 'CLOSED (orders paused)'}`,
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.message || 'Failed to update shop status. Please try again.',
      });
    } finally {
      setTogglingOpen(false);
    }
  };

  // Derive metrics
  const totalProducts = products.length;
  let lowStockCount = 0;
  for (const p of products) {
    if (p.variants) {
      for (const v of p.variants) {
        if (v.stockQuantity <= (v.lowStockThreshold ?? 5)) {
          lowStockCount++;
        }
      }
    }
  }

  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
  ).length;

  const pendingReturns = returns.filter((r) => r.status === 'requested' || r.status === 'pending').length;

  return (
    <PartnerLayout
      role="shop"
      title={profile?.name || user?.shopName || 'Shop Overview'}
      subtitle={`Category: ${profile?.categoryTemplateName || profile?.shopCategory || 'General'} • Multi-Vendor Console`}
      actions={
        <div className="flex items-center gap-3">
          {/* Open/Close Toggle Button */}
          {profile && (
            <button
              onClick={handleToggleStoreOpen}
              disabled={togglingOpen}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                profile.isOpen
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Power className={`w-3.5 h-3.5 ${togglingOpen ? 'animate-spin' : ''}`} />
              <span>{profile.isOpen ? 'Store OPEN' : 'Store CLOSED'}</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/partner/shop/products/new"
            className="p-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold">Add Product</p>
              <p className="text-[11px] text-purple-200 mt-0.5">With custom variants</p>
            </div>
          </Link>

          <Link
            href="/partner/shop/inventory"
            className="p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 shadow-xs transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Manage Stock</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Adjust inventory logs</p>
            </div>
          </Link>

          <Link
            href="/partner/shop/orders"
            className="p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 shadow-xs transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Live Orders</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Rider & self-delivery</p>
            </div>
          </Link>

          <Link
            href="/partner/shop/returns"
            className="p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 shadow-xs transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Returns / Exchanges</p>
              <p className="text-[11px] text-gray-500 mt-0.5">24-hour review portal</p>
            </div>
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Products
              </span>
              <ShoppingBag className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">{totalProducts}</p>
            <Link
              href="/partner/shop/products"
              className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 mt-1 inline-flex items-center gap-1"
            >
              <span>View catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Low Stock
              </span>
              <AlertCircle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
            </div>
            <p className="text-2xl font-black text-gray-900">{lowStockCount}</p>
            <Link
              href="/partner/shop/inventory"
              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 mt-1 inline-flex items-center gap-1"
            >
              <span>Audit inventory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Active Orders
              </span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">{activeOrders}</p>
            <Link
              href="/partner/shop/orders"
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1"
            >
              <span>Track fulfillment</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Pending Returns
              </span>
              <RotateCcw className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">{pendingReturns}</p>
            <Link
              href="/partner/shop/returns"
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 mt-1 inline-flex items-center gap-1"
            >
              <span>Review requests</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-gray-900">Recent Customer Orders</h2>
            </div>
            <Link
              href="/partner/shop/orders"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>View all orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 overflow-x-auto">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No orders received yet.</p>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/70 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-900">
                        #{order.orderNumber || order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.deliveryMethod === 'self' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          Self-Delivery: {order.sellerDeliveryStatus || 'pending'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {order.createdAt || order.timestamps?.createdAt
                        ? new Date(order.createdAt || order.timestamps?.createdAt).toLocaleDateString()
                        : ''}{' '}
                      • {order.items?.length || 0} item(s) • ₹{order.totalAmount || order.pricing?.total || 0}
                    </p>
                  </div>

                  <Link
                    href="/partner/shop/orders"
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition shrink-0"
                  >
                    Manage
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Returns Section */}
        {returns.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-gray-900">Return & Exchange Requests</h2>
              </div>
              <Link
                href="/partner/shop/returns"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>Review all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {returns.slice(0, 3).map((ret) => (
                <div
                  key={ret.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/70 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 uppercase">
                        {ret.type || ret.requestType || 'Return'}: {ret.reason?.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          ret.status === 'requested' || ret.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : ret.status === 'approved'
                            ? 'bg-blue-50 text-blue-700'
                            : ret.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {ret.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Order #{ret.orderNumber || ret.orderId?.slice(0, 8)} • Requested{' '}
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    href="/partner/shop/returns"
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
