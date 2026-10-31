'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Package,
  Bike,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import {
  apiGetOrderById,
  apiCancelOrder,
  apiCreateReturnRequest,
} from '@/lib/api';
import type { Order } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plan / Placed by mistake');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Return & Exchange State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return');
  const [returnReason, setReturnReason] = useState('size_issue');
  const [returnDescription, setReturnDescription] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await apiGetOrderById(id);
        setOrder(data);
      } catch (err: any) {
        console.error('Failed to load order:', err);
        setErrorMsg(err.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=/orders/${id}`);
      } else {
        loadOrder();
      }
    }
  }, [id, isAuthenticated, authLoading, router]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    setErrorMsg(null);
    try {
      const updated = await apiCancelOrder(order.id, cancelReason);
      setOrder(updated);
      setShowCancelModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Cannot cancel order at this stage');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmittingReturn(true);
    setErrorMsg(null);
    try {
      const itemsToReturn = (order.items || []).map((it) => ({
        variantId: it.itemId || it.id || '',
        productName: it.name,
        quantity: it.quantity,
      }));

      await apiCreateReturnRequest(order.id, {
        requestType: returnType,
        reason: returnReason,
        description: returnDescription.trim() || undefined,
        items: itemsToReturn,
      });

      setOrder((prev) => (prev ? { ...prev, returnStatus: 'pending' } : null));
      setReturnSuccessMsg('Your return request has been submitted for seller review!');
      setShowReturnModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Status Stepper Steps
  const steps = [
    { key: 'ordered', label: 'Order Placed', desc: 'Received by kitchen' },
    { key: 'preparing', label: 'Preparing Food', desc: 'Freshly cooking' },
    { key: 'ready', label: 'Ready for Pickup', desc: 'Packed & ready' },
    { key: 'dispatched', label: 'Out for Delivery', desc: 'Rider on the way' },
    { key: 'delivered', label: 'Delivered', desc: 'Delivered to you' },
  ];

  const getStepIndex = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ordered':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'dispatched':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const isCancelled = order?.status?.toLowerCase() === 'cancelled';
  const currentStep = order ? getStepIndex(order.status) : 0;
  const canCancel = order && ['ordered', 'preparing'].includes(order.status.toLowerCase());

  const isShopOrder = order?.orderType === 'shop';
  const isDelivered =
    order?.status?.toLowerCase() === 'delivered' ||
    order?.sellerDeliveryStatus === 'delivered';
  const deliveredAt =
    order?.sellerDeliveredAt ||
    order?.deliveredAt ||
    order?.timestamps?.deliveredAt;
  const isWithin24Hours =
    isDelivered &&
    (deliveredAt
      ? Date.now() - new Date(deliveredAt).getTime() <= 24 * 60 * 60 * 1000
      : true);
  const hasActiveReturn =
    order?.returnStatus && order?.returnStatus !== 'none';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="h-64 rounded-3xl shimmer" />
        <div className="h-44 rounded-3xl shimmer" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-xs text-gray-500">{errorMsg || 'We could not find this order.'}</p>
        <Link
          href="/orders"
          className="inline-block bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-full"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24">
      {/* Back Link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order History</span>
      </Link>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* 1. Header Status Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Order #{order.id.slice(0, 10)}</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">
                {order.timestamps?.createdAt ? new Date(order.timestamps.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
              {isShopOrder && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  Shop Order
                </span>
              )}
              {order.deliveryMethod === 'self' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Self-Delivery: {order.sellerDeliveryStatus?.toUpperCase() || 'PENDING'}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
              {order.restaurant?.name || (isShopOrder ? 'Shop Order' : 'Restaurant Order')}
            </h1>
            {hasActiveReturn && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
                <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                <span>Return Status: {order.returnStatus?.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Delivery PIN badge */}
          {order.delivery?.deliveryPin && !isCancelled && (
            <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-2xl text-right self-start sm:self-auto">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery OTP</span>
              <span className="text-lg font-black text-red-600 tracking-widest">{order.delivery.deliveryPin}</span>
            </div>
          )}
        </div>

        {/* Status Stepper */}
        {isCancelled ? (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">Order Cancelled</p>
              <p className="text-red-600 mt-0.5">
                {order.cancellation?.cancelReason || 'This order was cancelled by the customer.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={st.key}
                    className={`p-3 rounded-2xl border text-center transition ${
                      isCurrent
                        ? 'border-red-600 bg-red-50/50 shadow-xs'
                        : isPassed
                        ? 'border-emerald-200 bg-emerald-50/30 text-emerald-800'
                        : 'border-gray-100 bg-gray-50/50 text-gray-400 opacity-60'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold text-white bg-gray-300">
                      {isPassed ? (
                        <span className="bg-emerald-600 w-full h-full rounded-full flex items-center justify-center">✓</span>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-red-600' : isPassed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {st.label}
                    </p>
                    <p className="text-[10px] text-gray-400 hidden sm:block mt-0.5">{st.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery Partner Info */}
        {order.delivery?.deliveryBoyName && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{order.delivery.deliveryBoyName}</p>
                <p className="text-gray-500 text-[11px]">Assigned Delivery Partner</p>
              </div>
            </div>
            {order.delivery.deliveryBoyPhone && (
              <a
                href={`tel:${order.delivery.deliveryBoyPhone}`}
                className="bg-white border border-gray-200 text-gray-700 hover:text-red-600 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* 2. Order Details & Bill */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Items list */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Order Items ({order.items?.length || 0})
          </h2>
          <div className="divide-y divide-gray-100">
            {order.items?.map((it, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-gray-900">{it.name}</p>
                  <p className="text-gray-400 mt-0.5">₹{it.price} × {it.quantity}</p>
                </div>
                <span className="font-bold text-gray-900">₹{it.price * it.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">Delivery Address:</p>
            <p className="mt-0.5">{order.customer?.deliveryAddress}</p>
          </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Payment Breakdown
          </h2>

          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span>₹{Number(order.pricing?.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{Number(order.pricing?.deliveryFee || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes &amp; Platform Fee</span>
              <span>₹{Number(order.pricing?.convenienceFee || 0).toFixed(2)}</span>
            </div>
            {Number(order.pricing?.discount || 0) > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Savings</span>
                <span>-₹{Number(order.pricing?.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-base text-gray-900">
              <span>Total Bill</span>
              <span>₹{Number(order.pricing?.total || 0).toFixed(2)}</span>
            </div>
            <div className="text-[11px] text-gray-400 pt-1">
              Payment Method: <strong className="text-gray-700">{order.payment?.method || 'Cash on Delivery'}</strong>
            </div>
          </div>

          {/* Cancellation button */}
          {canCancel && (
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full text-center text-xs font-bold text-red-600 hover:text-red-700 py-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition"
              >
                Cancel Order
              </button>
            </div>
          )}

          {/* 24-Hour Return / Exchange Workflow */}
          {isDelivered && (
            <div className="pt-4 border-t border-gray-100 space-y-2">
              {hasActiveReturn ? (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                    <span>Return / Exchange Status: {order.returnStatus?.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-purple-700">
                    Your request has been registered and is being reviewed by the merchant.
                  </p>
                </div>
              ) : isWithin24Hours ? (
                <div>
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-purple-700 hover:text-purple-800 py-2.5 bg-purple-50 hover:bg-purple-100 rounded-xl transition border border-purple-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                    <span>Request 24-Hour Return or Exchange</span>
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-1">
                    Guaranteed within 24 hours of delivery
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-gray-400 text-center py-1">
                  24-Hour Return Window Expired
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {returnSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{returnSuccessMsg}</span>
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Request Return or Exchange
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Order #{order.id.slice(0, 10)} • 24-Hour Policy Window Active
              </p>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnType('return')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      returnType === 'return'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Return &amp; Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnType('exchange')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      returnType === 'exchange'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Size / Variant Exchange
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-medium"
                >
                  <option value="size_issue">Size does not fit / Need size exchange</option>
                  <option value="wrong_item">Received wrong item or variant</option>
                  <option value="defective">Defective or damaged product</option>
                  <option value="not_as_described">Item not as described</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Details / Customer Note
                </label>
                <textarea
                  rows={2}
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  placeholder="Describe the issue or desired replacement size..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-50 transition shadow-md shadow-purple-600/20"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Cancel this order?</h3>
            <p className="text-xs text-gray-500">
              Orders can only be cancelled while the kitchen is still preparing.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              >
                <option value="Change of plan">Change of plan</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Need to change delivery address">Need to change delivery address</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-xl"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
