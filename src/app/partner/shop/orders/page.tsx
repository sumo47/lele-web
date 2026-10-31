'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Truck,
  Bike,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  User,
  MapPin,
  Phone,
  Package,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetMyShopOrders,
  apiUpdateSelfDeliveryStatus,
} from '@/lib/api';
import type { Order } from '@/lib/types';

export default function ShopOrdersPage() {
  return (
    <PartnerRouteGuard role="shop">
      <ShopOrdersContent />
    </PartnerRouteGuard>
  );
}

function ShopOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'dispatched' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetMyShopOrders();
      setOrders(Array.isArray(res) ? res : (res?.orders || []));
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to load shop orders.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateSelfDelivery = async (orderId: string, status: 'dispatched' | 'delivered') => {
    setUpdatingId(orderId);
    setFeedback(null);

    try {
      await apiUpdateSelfDeliveryStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                sellerDeliveryStatus: status,
                status: status === 'delivered' ? 'delivered' : o.status,
              }
            : o
        )
      );
      setFeedback({
        type: 'success',
        text: `Order status updated to ${status.toUpperCase()}!`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Failed to update delivery status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const orderNum = o.orderNumber || o.id.slice(0, 8);
    const addr = o.deliveryAddress || o.customer?.deliveryAddress || '';
    const matchesSearch =
      orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'pending') {
      return ['pending', 'confirmed', 'preparing'].includes(o.status);
    }
    if (activeTab === 'dispatched') {
      return o.sellerDeliveryStatus === 'dispatched' || o.status === 'out_for_delivery';
    }
    if (activeTab === 'delivered') {
      return o.status === 'delivered';
    }
    if (activeTab === 'cancelled') {
      return o.status === 'cancelled';
    }
    return true;
  });

  return (
    <PartnerLayout
      role="shop"
      title="Shop Orders"
      subtitle="Fulfill customer orders via Seller Self-Delivery or LELE Fleet"
    >
      <div className="space-y-6">
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

        {/* Filter bar & Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl shadow-2xs w-full sm:w-auto overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending / Prep' },
                { id: 'dispatched', label: 'In Transit / Dispatched' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'cancelled', label: 'Cancelled' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order # or address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">No orders found</h3>
            <p className="text-xs text-gray-500 mt-1">
              There are no orders matching the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isSelfDelivery = order.deliveryMethod === 'self';
              const canDispatch =
                isSelfDelivery &&
                order.status !== 'delivered' &&
                order.status !== 'cancelled' &&
                order.sellerDeliveryStatus !== 'dispatched' &&
                order.sellerDeliveryStatus !== 'delivered';

              const canDeliver =
                isSelfDelivery &&
                order.status !== 'delivered' &&
                order.status !== 'cancelled' &&
                order.sellerDeliveryStatus === 'dispatched';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-gray-900">
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
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isSelfDelivery
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {isSelfDelivery ? (
                            <>
                              <Truck className="w-3 h-3" />
                              <span>Self-Delivery</span>
                            </>
                          ) : (
                            <>
                              <Bike className="w-3 h-3" />
                              <span>LELE Rider</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono mt-1">
                        Ordered:{' '}
                        {new Date(
                          order.createdAt || order.timestamps?.createdAt || Date.now()
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-400 font-medium">Total Amount</span>
                      <p className="text-base font-black text-gray-900">
                        ₹{order.totalAmount || order.pricing?.total || 0}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Info & Customer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50/70 p-4 rounded-2xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        <span>Delivery Address</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed pl-5">
                        {order.deliveryAddress || order.customer?.deliveryAddress || 'Address on file'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700">
                        <Truck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Fulfillment Mode</span>
                      </div>
                      <p className="text-gray-600 pl-5">
                        {isSelfDelivery
                          ? `Self-Delivery Status: ${order.sellerDeliveryStatus?.toUpperCase() || 'PENDING'}`
                          : 'Handled by LELE Delivery Fleet'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ordered Products ({order.items?.length || 0})
                    </p>
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                      {order.items?.map((item, idx) => (
                        <div
                          key={item.id || item.itemId || idx}
                          className="p-3 flex items-center justify-between text-xs bg-white"
                        >
                          <div>
                            <span className="font-bold text-gray-900">{item.name}</span>
                            {item.variantTitle && (
                              <span className="text-gray-500 ml-2">
                                ({item.variantTitle})
                              </span>
                            )}
                            <p className="text-[11px] text-gray-400">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                          <span className="font-bold text-gray-900">
                            ₹{item.subtotal || item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Self-Delivery Action Buttons */}
                  {isSelfDelivery && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                      {canDispatch && (
                        <button
                          onClick={() => handleUpdateSelfDelivery(order.id, 'dispatched')}
                          disabled={updatingId === order.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                        >
                          {updatingId === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Truck className="w-3.5 h-3.5" />
                          )}
                          <span>Mark as Dispatched</span>
                        </button>
                      )}

                      {canDeliver && (
                        <button
                          onClick={() => handleUpdateSelfDelivery(order.id, 'delivered')}
                          disabled={updatingId === order.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                        >
                          {updatingId === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Mark Delivered to Customer</span>
                        </button>
                      )}

                      {order.sellerDeliveryStatus === 'delivered' && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Order Delivered</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
