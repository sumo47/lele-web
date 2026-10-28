'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Bike,
  Power,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Key,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Wallet,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetRiderOrders,
  apiGetAvailableRiderOrders,
  apiGetRiderProfile,
  apiUpdateRiderStatus,
  apiAcceptRiderOrder,
  apiVerifyRiderPickup,
  apiCompleteRiderDelivery,
} from '@/lib/api';
import type { RiderOrder, RiderProfile } from '@/lib/types';

export default function RiderOverviewPage() {
  return (
    <PartnerRouteGuard role="rider">
      <RiderOverviewContent />
    </PartnerRouteGuard>
  );
}

function RiderOverviewContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState<RiderOrder[]>([]);
  const [availableOrders, setAvailableOrders] = useState<RiderOrder[]>([]);
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick PIN Modals
  const [pickupModalOrder, setPickupModalOrder] = useState<RiderOrder | null>(null);
  const [pickupPin, setPickupPin] = useState('');
  const [deliverModalOrder, setDeliverModalOrder] = useState<RiderOrder | null>(null);
  const [deliveryPin, setDeliveryPin] = useState('');
  const [pinActionLoading, setPinActionLoading] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [assignedRes, availableRes, profileRes] = await Promise.allSettled([
        apiGetRiderOrders({ limit: 15 }),
        apiGetAvailableRiderOrders({ limit: 10 }),
        apiGetRiderProfile(),
      ]);

      if (assignedRes.status === 'fulfilled') {
        setAssignedOrders(assignedRes.value.data || []);
      }
      if (availableRes.status === 'fulfilled') {
        setAvailableOrders(availableRes.value.data || []);
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
      }
    } catch (err: any) {
      console.error('Failed to load rider dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleDuty = async () => {
    if (!profile) return;
    const nextStatus = !profile.isOnline;
    setTogglingStatus(true);
    setFeedbackMsg(null);

    try {
      const res = await apiUpdateRiderStatus(nextStatus);
      setProfile((prev) => (prev ? { ...prev, isOnline: res.isOnline } : null));
      setFeedbackMsg({
        type: 'success',
        text: `You are now ${nextStatus ? 'ONLINE — Ready to receive deliveries!' : 'OFFLINE — Duty paused.'}`,
      });
      await loadData(true);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to update duty status.' });
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleClaimOrder = async (orderId: string) => {
    setFeedbackMsg(null);
    try {
      await apiAcceptRiderOrder(orderId);
      setFeedbackMsg({
        type: 'success',
        text: 'Order accepted! Navigate to the restaurant for pickup.',
      });
      await loadData(true);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to claim delivery.' });
    }
  };

  const handleVerifyPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupModalOrder || !pickupPin.trim()) return;
    setPinActionLoading(true);

    try {
      await apiVerifyRiderPickup(pickupModalOrder.id, pickupPin.trim());
      setFeedbackMsg({
        type: 'success',
        text: 'Store pickup verified! Proceed to customer delivery address.',
      });
      setPickupModalOrder(null);
      setPickupPin('');
      await loadData(true);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Invalid Store Pickup PIN.' });
    } finally {
      setPinActionLoading(false);
    }
  };

  const handleCompleteDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverModalOrder || !deliveryPin.trim()) return;
    setPinActionLoading(true);

    try {
      const res = await apiCompleteRiderDelivery(deliverModalOrder.id, deliveryPin.trim());
      setFeedbackMsg({
        type: 'success',
        text: `Delivery completed! ₹${res.payout || 40} credited to your rider wallet.`,
      });
      setDeliverModalOrder(null);
      setDeliveryPin('');
      await loadData(true);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Invalid Customer Delivery PIN.' });
    } finally {
      setPinActionLoading(false);
    }
  };

  const activeTrips = assignedOrders.filter(
    (o) =>
      o.status === 'accepted' ||
      o.status === 'preparing' ||
      o.status === 'ready' ||
      o.status === 'dispatched' ||
      o.status === 'on_the_way'
  );
  const completedTrips = assignedOrders.filter(
    (o) => o.status === 'delivered' || o.status === 'completed'
  );
  const todayEarnings = completedTrips.reduce((sum, o) => sum + (Number(o.riderPayout) || 40), 0);

  return (
    <PartnerLayout
      role="rider"
      title="Rider Delivery Console"
      subtitle={`Welcome, ${user?.name || 'Rider'}. Check assigned trips, claim broadcast orders, and track your wallet.`}
      actions={
        <div className="flex items-center gap-3">
          {profile && (
            <button
              onClick={handleToggleDuty}
              disabled={togglingStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                profile.isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } disabled:opacity-50`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{profile.isOnline ? 'Duty Online' : 'Duty Offline'}</span>
            </button>
          )}

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
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

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Active Trips */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Active Trips
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900">{activeTrips.length}</div>
            <p className="text-xs text-gray-500 mt-0.5">Trips currently in delivery</p>
          </div>
        </div>

        {/* Broadcast Orders Pool */}
        <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Available Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900">{availableOrders.length}</div>
            <p className="text-xs text-gray-500 mt-0.5">Ready for pickup in Nirmali</p>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Completed Trips
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900">
              {profile?.totalDeliveries || completedTrips.length}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Total successful drop-offs</p>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Wallet Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-700">
              ₹{Math.round(profile?.walletBalance || todayEarnings)}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Earned from deliveries</p>
          </div>
        </div>
      </div>

      {/* Active Deliveries Queue */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Active Delivery Trips</h2>
            <p className="text-xs text-gray-500">Pick up from restaurant and deliver to customer</p>
          </div>
          <Link
            href="/partner/rider/deliveries"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Manage Deliveries <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeTrips.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
            <Bike className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <h3 className="text-sm font-bold text-gray-700">No Active Trips</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-0.5">
              Turn your duty status <strong>Online</strong> and claim available orders below to start delivering.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTrips.map((order) => {
              const isDispatched = order.status === 'dispatched' || order.status === 'on_the_way';
              const isAwaitingPickup = order.status === 'accepted' || order.status === 'preparing' || order.status === 'ready';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ml-2 bg-emerald-100 text-emerald-800">
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700">
                        +₹{order.riderPayout || 40} Payout
                      </span>
                    </div>
                  </div>

                  {/* Pickup & Drop Details */}
                  <div className="space-y-2.5 text-xs">
                    {/* Restaurant Pickup */}
                    <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>Pickup: {order.restaurant?.name}</span>
                      </div>
                      <p className="text-gray-500 pl-5 text-[11px]">
                        {order.restaurant?.address || 'Restaurant address'}
                      </p>
                      {order.restaurant?.phone && (
                        <p className="text-gray-600 pl-5 text-[11px] font-mono">
                          Phone: {order.restaurant.phone}
                        </p>
                      )}
                    </div>

                    {/* Customer Dropoff */}
                    <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Deliver to: {order.customer?.name}</span>
                      </div>
                      <p className="text-gray-600 pl-5 text-[11px]">
                        {order.customer?.deliveryAddress}
                      </p>
                      {order.customer?.phone && (
                        <p className="text-gray-600 pl-5 text-[11px] font-mono">
                          Phone: {order.customer.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Trip Actions */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-500 font-medium">
                      COD Collection: ₹{Math.round(order.pricing?.total || 0)}
                    </span>

                    {isAwaitingPickup && (
                      <button
                        onClick={() => {
                          setPickupModalOrder(order);
                          setPickupPin('');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Confirm Store Pickup</span>
                      </button>
                    )}

                    {isDispatched && (
                      <button
                        onClick={() => {
                          setDeliverModalOrder(order);
                          setDeliveryPin('');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify Customer PIN & Deliver</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Orders Broadcast Pool */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Available Delivery Orders</h2>
            <p className="text-xs text-gray-500">Claim unassigned orders ready in the broadcast pool</p>
          </div>
        </div>

        {availableOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <h3 className="text-sm font-bold text-gray-700">No Orders in Broadcast Pool</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-0.5">
              When restaurants in Nirmali prepare new customer deliveries, available orders will show here for instant claiming.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:border-gray-300 p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <span className="font-mono text-xs font-bold text-gray-900">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +₹{order.riderPayout || 40} Payout
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-gray-400 uppercase text-[10px] font-bold block">
                        Pickup Restaurant
                      </span>
                      <strong className="text-gray-900 block font-bold">
                        {order.restaurant?.name || 'Restaurant Outlet'}
                      </strong>
                      <span className="text-gray-500 text-[11px] block truncate">
                        {order.restaurant?.address || 'Nirmali'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 uppercase text-[10px] font-bold block">
                        Dropoff Address
                      </span>
                      <span className="text-gray-700 block truncate">
                        {order.customer?.deliveryAddress}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500">
                    COD: ₹{Math.round(order.pricing?.total || 0)}
                  </span>
                  <button
                    onClick={() => handleClaimOrder(order.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Claim Delivery</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pickup PIN Modal */}
      {pickupModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Confirm Store Pickup</h3>
              <button
                onClick={() => setPickupModalOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Ask the kitchen staff at <strong>{pickupModalOrder.restaurant?.name}</strong> for the 4-digit pickup verification PIN:
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
                  disabled={pinActionLoading || !pickupPin.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {pinActionLoading ? 'Verifying...' : 'Verify Pickup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery PIN Modal */}
      {deliverModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Complete Delivery</h3>
              <button
                onClick={() => setDeliverModalOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Ask customer <strong>{deliverModalOrder.customer?.name}</strong> for the delivery PIN shown on their order screen:
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
                  disabled={pinActionLoading || !deliveryPin.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {pinActionLoading ? 'Completing...' : 'Verify & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
