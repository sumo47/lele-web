'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Bike,
  MapPin,
  Phone,
  Key,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetRiderOrders,
  apiGetAvailableRiderOrders,
  apiAcceptRiderOrder,
  apiRejectRiderOrder,
  apiVerifyRiderPickup,
  apiCompleteRiderDelivery,
} from '@/lib/api';
import type { RiderOrder } from '@/lib/types';

export default function RiderDeliveriesPage() {
  return (
    <PartnerRouteGuard role="rider">
      <RiderDeliveriesContent />
    </PartnerRouteGuard>
  );
}

type DeliveryTab = 'active' | 'available' | 'completed' | 'all';

function RiderDeliveriesContent() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState<RiderOrder[]>([]);
  const [availableOrders, setAvailableOrders] = useState<RiderOrder[]>([]);
  const [activeTab, setActiveTab] = useState<DeliveryTab>('active');

  // Action Modals
  const [pickupModalOrder, setPickupModalOrder] = useState<RiderOrder | null>(null);
  const [pickupPin, setPickupPin] = useState('');
  const [deliverModalOrder, setDeliverModalOrder] = useState<RiderOrder | null>(null);
  const [deliveryPin, setDeliveryPin] = useState('');
  const [rejectModalOrder, setRejectModalOrder] = useState<RiderOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDeliveries = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [assignedRes, availableRes] = await Promise.allSettled([
        apiGetRiderOrders({ limit: 50 }),
        apiGetAvailableRiderOrders({ limit: 20 }),
      ]);

      if (assignedRes.status === 'fulfilled') {
        setAssignedOrders(assignedRes.value.data || []);
      }
      if (availableRes.status === 'fulfilled') {
        setAvailableOrders(availableRes.value.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load rider deliveries:', err);
      setToastMsg({ type: 'error', text: err?.message || 'Failed to load deliveries.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const activeOrders = useMemo(() => {
    return assignedOrders.filter(
      (o) =>
        o.status === 'accepted' ||
        o.status === 'preparing' ||
        o.status === 'ready' ||
        o.status === 'dispatched' ||
        o.status === 'on_the_way'
    );
  }, [assignedOrders]);

  const completedOrders = useMemo(() => {
    return assignedOrders.filter((o) => o.status === 'delivered' || o.status === 'completed');
  }, [assignedOrders]);

  const displayedOrders = useMemo(() => {
    if (activeTab === 'active') return activeOrders;
    if (activeTab === 'available') return availableOrders;
    if (activeTab === 'completed') return completedOrders;
    return assignedOrders;
  }, [activeTab, activeOrders, availableOrders, completedOrders, assignedOrders]);

  const handleClaim = async (orderId: string) => {
    setActionLoading(true);
    setToastMsg(null);
    try {
      await apiAcceptRiderOrder(orderId);
      setToastMsg({
        type: 'success',
        text: 'Delivery accepted! Pick up the order from restaurant.',
      });
      await loadDeliveries(true);
      setActiveTab('active');
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to claim delivery.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupModalOrder || !pickupPin.trim()) return;
    setActionLoading(true);

    try {
      await apiVerifyRiderPickup(pickupModalOrder.id, pickupPin.trim());
      setToastMsg({
        type: 'success',
        text: 'Store pickup verified! Proceed to customer delivery address.',
      });
      setPickupModalOrder(null);
      setPickupPin('');
      await loadDeliveries(true);
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Invalid Store Pickup PIN.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverModalOrder || !deliveryPin.trim()) return;
    setActionLoading(true);

    try {
      const res = await apiCompleteRiderDelivery(deliverModalOrder.id, deliveryPin.trim());
      setToastMsg({
        type: 'success',
        text: `Delivery completed! ₹${res.payout || 40} added to your rider wallet.`,
      });
      setDeliverModalOrder(null);
      setDeliveryPin('');
      await loadDeliveries(true);
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Invalid Customer Delivery PIN.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOrder = async () => {
    if (!rejectModalOrder) return;
    setActionLoading(true);

    try {
      await apiRejectRiderOrder(rejectModalOrder.id);
      setToastMsg({
        type: 'success',
        text: 'Order declined and returned to dispatch pool.',
      });
      setRejectModalOrder(null);
      await loadDeliveries(true);
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to decline order.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PartnerLayout
      role="rider"
      title="Live Deliveries & Trips"
      subtitle="Manage pickup trips, verify security PINs, and claim unassigned delivery broadcasts."
      actions={
        <button
          onClick={() => loadDeliveries(true)}
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl mb-6 shadow-xs overflow-x-auto scrollbar-none">
        {[
          { id: 'active', label: 'Active Trips', count: activeOrders.length },
          { id: 'available', label: 'Broadcast Pool', count: availableOrders.length },
          { id: 'completed', label: 'Delivered', count: completedOrders.length },
          { id: 'all', label: 'All History', count: assignedOrders.length },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DeliveryTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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

      {/* Delivery Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" />
          <p className="text-sm font-semibold text-gray-600">Loading deliveries...</p>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
          <Bike className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-bold text-gray-800">No Orders in this Section</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Check the Broadcast Pool tab for orders ready for pickup across Nirmali.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedOrders.map((order) => {
            const isAvailable = activeTab === 'available';
            const isDelivered = order.status === 'delivered' || order.status === 'completed';
            const isDispatched = order.status === 'dispatched' || order.status === 'on_the_way';
            const isAwaitingPickup = !isAvailable && !isDelivered && !isDispatched;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isAvailable
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    +₹{order.riderPayout || 40} Payout
                  </span>
                </div>

                {/* Steps Details */}
                <div className="space-y-3 text-xs flex-1">
                  {/* Step 1: Restaurant Pickup */}
                  <div className="p-3 bg-red-50/40 border border-red-100/60 rounded-xl space-y-1">
                    <div className="font-bold text-gray-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        1. Restaurant Pickup
                      </span>
                      {order.restaurant?.phone && (
                        <a
                          href={`tel:${order.restaurant.phone}`}
                          className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 pl-5">{order.restaurant?.name}</p>
                    <p className="text-gray-500 pl-5 text-[11px]">
                      {order.restaurant?.address || 'Nirmali'}
                    </p>
                  </div>

                  {/* Step 2: Customer Delivery */}
                  <div className="p-3 bg-emerald-50/40 border border-emerald-100/60 rounded-xl space-y-1">
                    <div className="font-bold text-gray-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        2. Customer Delivery
                      </span>
                      {order.customer?.phone && (
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 pl-5">{order.customer?.name}</p>
                    <p className="text-gray-600 pl-5 text-[11px]">
                      {order.customer?.deliveryAddress}
                    </p>
                  </div>

                  {/* Order Items Summary */}
                  {order.items && order.items.length > 0 && (
                    <div className="text-[11px] text-gray-500 truncate pt-1">
                      Items: {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">
                      Collect from Customer
                    </span>
                    <strong className="text-gray-900 font-mono font-bold">
                      ₹{Math.round(order.pricing?.total || 0)} ({order.payment?.method || 'COD'})
                    </strong>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isAvailable && (
                      <button
                        onClick={() => handleClaim(order.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Claim Order</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isAwaitingPickup && (
                      <>
                        <button
                          onClick={() => setRejectModalOrder(order)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => {
                            setPickupModalOrder(order);
                            setPickupPin('');
                          }}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Store PIN</span>
                        </button>
                      </>
                    )}

                    {isDispatched && (
                      <button
                        onClick={() => {
                          setDeliverModalOrder(order);
                          setDeliveryPin('');
                        }}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Deliver PIN</span>
                      </button>
                    )}

                    {isDelivered && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pickup PIN Verification Modal */}
      {pickupModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Verify Store Pickup PIN</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ask <strong>{pickupModalOrder.restaurant?.name}</strong> staff for the 4-digit pickup PIN:
            </p>
            <form onSubmit={handleVerifyPickup} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                value={pickupPin}
                onChange={(e) => setPickupPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit PIN"
                className="w-full px-4 py-3 text-center font-mono font-bold text-2xl tracking-widest bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPickupModalOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !pickupPin.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {actionLoading ? 'Verifying...' : 'Verify Pickup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Delivery PIN Modal */}
      {deliverModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Verify Customer Delivery PIN</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ask customer <strong>{deliverModalOrder.customer?.name}</strong> for their 4-digit delivery PIN to complete the trip:
            </p>
            <form onSubmit={handleCompleteDelivery} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                value={deliveryPin}
                onChange={(e) => setDeliveryPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit PIN"
                className="w-full px-4 py-3 text-center font-mono font-bold text-2xl tracking-widest bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliverModalOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !deliveryPin.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {actionLoading ? 'Verifying...' : 'Complete & Credit ₹40'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decline Order Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Decline Delivery</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to decline order #{rejectModalOrder.id.slice(-6).toUpperCase()}? It will be reassigned to other nearby delivery riders.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleDeclineOrder}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Declining...' : 'Yes, Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
