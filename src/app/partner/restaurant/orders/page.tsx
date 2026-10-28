'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  ChefHat,
  Bike,
  User,
  Phone,
  MapPin,
  Key,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetVendorOrders,
  apiAcceptVendorOrder,
  apiUpdateVendorOrderStatus,
  apiRejectVendorOrder,
} from '@/lib/api';
import type { VendorOrder } from '@/lib/types';

export default function RestaurantOrdersPage() {
  return (
    <PartnerRouteGuard role="vendor">
      <RestaurantOrdersContent />
    </PartnerRouteGuard>
  );
}

type TabType = 'all' | 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

function RestaurantOrdersContent() {
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);

  // Action Modals State
  const [acceptModalOrder, setAcceptModalOrder] = useState<VendorOrder | null>(null);
  const [prepTime, setPrepTime] = useState<number>(20);
  const [rejectModalOrder, setRejectModalOrder] = useState<VendorOrder | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Item Out of Stock');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiGetVendorOrders({ limit: 50 });
      setOrders(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch vendor orders:', err);
      setToastMsg({ type: 'error', text: err?.message || 'Failed to load kitchen orders.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Open highlighted order if deep linked
  useEffect(() => {
    if (highlightedOrderId && orders.length > 0) {
      const match = orders.find((o) => o.id === highlightedOrderId);
      if (match) setSelectedOrder(match);
    }
  }, [highlightedOrderId, orders]);

  // Tab Filtering & Search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === 'pending') {
        if (order.status !== 'ordered' && order.status !== 'pending') return false;
      } else if (activeTab === 'preparing') {
        if (order.status !== 'preparing') return false;
      } else if (activeTab === 'ready') {
        if (order.status !== 'ready' && order.status !== 'dispatched' && order.status !== 'on_the_way')
          return false;
      } else if (activeTab === 'delivered') {
        if (order.status !== 'delivered' && order.status !== 'completed') return false;
      } else if (activeTab === 'cancelled') {
        if (order.status !== 'cancelled' && order.status !== 'rejected') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = order.id.toLowerCase().includes(q);
        const customerMatch = order.customer?.name?.toLowerCase().includes(q);
        const phoneMatch = order.customer?.phone?.includes(q);
        const itemMatch = order.items?.some((i) => i.name?.toLowerCase().includes(q));
        if (!idMatch && !customerMatch && !phoneMatch && !itemMatch) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const handleAcceptOrder = async () => {
    if (!acceptModalOrder) return;
    setActionLoading(true);
    setToastMsg(null);

    try {
      await apiAcceptVendorOrder(acceptModalOrder.id, prepTime);
      setToastMsg({
        type: 'success',
        text: `Order #${acceptModalOrder.id.slice(-6).toUpperCase()} accepted with ${prepTime} min prep time!`,
      });
      setAcceptModalOrder(null);
      await fetchOrders(true);
      if (selectedOrder?.id === acceptModalOrder.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: 'preparing', prepTimeMinutes: prepTime } : null));
      }
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to accept order.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setActionLoading(true);
    setToastMsg(null);

    try {
      await apiUpdateVendorOrderStatus(orderId, 'ready');
      setToastMsg({
        type: 'success',
        text: `Order marked READY! Alert sent to delivery rider.`,
      });
      await fetchOrders(true);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: 'ready' } : null));
      }
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to mark order ready.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectModalOrder) return;
    if (!rejectReason.trim()) {
      setToastMsg({ type: 'error', text: 'Please select or provide a rejection reason.' });
      return;
    }

    setActionLoading(true);
    setToastMsg(null);

    try {
      await apiRejectVendorOrder(rejectModalOrder.id, rejectReason.trim());
      setToastMsg({
        type: 'success',
        text: `Order #${rejectModalOrder.id.slice(-6).toUpperCase()} has been rejected.`,
      });
      setRejectModalOrder(null);
      await fetchOrders(true);
      if (selectedOrder?.id === rejectModalOrder.id) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to reject order.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PartnerLayout
      role="restaurant"
      title="Live Kitchen Orders"
      subtitle="Accept incoming orders, set preparation times, and track rider handoffs."
      actions={
        <button
          onClick={() => fetchOrders(true)}
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

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              {
                id: 'pending',
                label: 'Pending',
                count: orders.filter((o) => o.status === 'ordered' || o.status === 'pending').length,
              },
              {
                id: 'preparing',
                label: 'Cooking',
                count: orders.filter((o) => o.status === 'preparing').length,
              },
              {
                id: 'ready',
                label: 'Ready for Pickup',
                count: orders.filter((o) => o.status === 'ready' || o.status === 'dispatched' || o.status === 'on_the_way').length,
              },
              {
                id: 'delivered',
                label: 'Delivered',
                count: orders.filter((o) => o.status === 'delivered' || o.status === 'completed').length,
              },
              {
                id: 'cancelled',
                label: 'Cancelled',
                count: orders.filter((o) => o.status === 'cancelled' || o.status === 'rejected').length,
              },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, customer..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List / Empty State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
          <p className="text-sm font-semibold text-gray-600">Loading kitchen orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-bold text-gray-800">No Orders in this View</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try clearing search filter.`
              : 'There are currently no orders in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'ordered' || order.status === 'pending';
            const isPreparing = order.status === 'preparing';
            const isReady = order.status === 'ready';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all p-5 flex flex-col justify-between"
              >
                {/* Header */}
                <div className="border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isPending
                            ? 'bg-amber-100 text-amber-800'
                            : isPreparing
                            ? 'bg-blue-100 text-blue-800'
                            : isReady
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'delivered' || order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 font-medium">
                      {new Date(order.timestamps?.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-bold text-gray-900">{order.customer?.name}</span>
                    </div>
                    {order.customer?.phone && (
                      <span className="text-gray-500 font-mono text-[11px]">
                        {order.customer.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 mb-4 flex-1">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full border shrink-0 ${
                            it.isVeg ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500 border-red-600'
                          }`}
                        />
                        <span className="font-bold text-gray-900">{it.quantity}x</span>
                        <span className="text-gray-800 font-medium">{it.name}</span>
                      </div>
                      <span className="text-gray-700 font-semibold font-mono">
                        ₹{Math.round(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}

                  {/* Cooking instructions note */}
                  {order.cookingInstructions && (
                    <div className="mt-2 p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl text-xs text-amber-900 font-medium">
                      <strong className="block text-[11px] uppercase tracking-wider text-amber-800">
                        Cooking Note:
                      </strong>
                      &ldquo;{order.cookingInstructions}&rdquo;
                    </div>
                  )}

                  {/* Pickup PIN & Rider Info */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {order.pickupPin && (
                      <div className="p-2 bg-gray-50 rounded-lg text-xs flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-gray-500">Pickup PIN:</span>
                        <strong className="font-mono font-bold text-purple-700">
                          {order.pickupPin}
                        </strong>
                      </div>
                    )}
                    {order.rider?.name && (
                      <div className="p-2 bg-gray-50 rounded-lg text-xs flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-gray-500">Rider:</span>
                        <strong className="text-gray-900 truncate">{order.rider.name}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-black text-gray-900">
                      ₹{Math.round(order.pricing?.total || 0)}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">
                      {order.payment?.method || 'COD'} • {order.payment?.status || 'pending'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => setRejectModalOrder(order)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setAcceptModalOrder(order);
                            setPrepTime(order.prepTimeMinutes || 20);
                          }}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-xs"
                        >
                          Accept
                        </button>
                      </>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleMarkReady(order.id)}
                        disabled={actionLoading}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-xs"
                      >
                        Mark Ready for Pickup
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accept Order Modal */}
      {acceptModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Accept Order #{acceptModalOrder.id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setAcceptModalOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Select the estimated kitchen cooking time before this order is ready for delivery rider pickup:
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPrepTime(mins)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    prepTime === mins
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAcceptModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcceptOrder}
                disabled={actionLoading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Accepting...' : `Confirm & Cook (${prepTime}m)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Reject Order #{rejectModalOrder.id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setRejectModalOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Please specify the reason for rejecting this order. The customer will be informed immediately:
            </p>

            <div className="space-y-2">
              {[
                'Item Out of Stock',
                'Kitchen at Max Capacity',
                'Closing Early / Power Cut',
                'Special Ingredients Unavailable',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    rejectReason === reason
                      ? 'border-red-500 bg-red-50/50 text-red-900'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleRejectOrder}
                disabled={actionLoading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Order Details #{selectedOrder.id.slice(-6).toUpperCase()}
                </h3>
                <span className="text-xs text-gray-400">
                  Placed on {new Date(selectedOrder.timestamps?.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Delivery */}
            <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-500" />
                Customer: {selectedOrder.customer?.name}
              </div>
              {selectedOrder.customer?.phone && (
                <div className="text-gray-600 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {selectedOrder.customer.phone}
                </div>
              )}
              {selectedOrder.customer?.deliveryAddress && (
                <div className="text-gray-600 flex items-start gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>{selectedOrder.customer.deliveryAddress}</span>
                </div>
              )}
            </div>

            {/* Dishes Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Dishes in this Order
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full border shrink-0 ${
                          it.isVeg ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500 border-red-600'
                        }`}
                      />
                      <span className="font-black text-gray-900">{it.quantity}x</span>
                      <div>
                        <span className="font-semibold text-gray-800">{it.name}</span>
                        {it.selectedVariation && (
                          <span className="text-[11px] text-gray-400 block">
                            Option: {it.selectedVariation.name || it.selectedVariation}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold font-mono text-gray-900">
                      ₹{Math.round(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Pricing */}
            <div className="bg-gray-50 rounded-xl p-3.5 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{Math.round(selectedOrder.pricing?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-gray-900 pt-1 border-t border-gray-200">
                <span>Order Total</span>
                <span>₹{Math.round(selectedOrder.pricing?.total || 0)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
