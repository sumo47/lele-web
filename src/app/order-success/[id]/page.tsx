'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { apiGetOrderById } from '@/lib/api';
import type { Order } from '@/lib/types';

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await apiGetOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadOrder();
    }
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Celebration Header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-xs text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            Thank you! Your order has been placed.
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
            The kitchen is preparing your fresh meal right now. Delivery partner will be assigned shortly.
          </p>
        </div>

        {/* Order ID & Pins */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 max-w-md mx-auto flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Order Reference</span>
            <span className="font-mono font-bold text-gray-900 text-sm">{id.slice(0, 12)}</span>
          </div>
          {order?.delivery?.deliveryPin && (
            <div className="text-right">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Delivery PIN</span>
              <span className="font-mono font-extrabold text-red-600 text-sm tracking-widest">
                {order.delivery.deliveryPin}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={`/orders/${id}`}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow transition flex items-center justify-center gap-2"
          >
            <span>Live Order Tracking</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/orders"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition"
          >
            View All Orders
          </Link>
          <Link
            href="/catalog"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-5 py-3 rounded-full transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Order Summary Snapshot */}
      {order && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Summary Details
          </h2>

          <div className="divide-y divide-gray-100">
            {order.items?.map((it, idx) => (
              <div key={idx} className="py-2.5 flex justify-between text-xs">
                <span className="font-semibold text-gray-800">
                  {it.name} × {it.quantity}
                </span>
                <span className="font-bold text-gray-900">₹{it.price * it.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-sm text-gray-900">
            <span>Total Paid (COD/Online)</span>
            <span>₹{Number(order.pricing?.total || 0).toFixed(2)}</span>
          </div>

          <div className="text-xs text-gray-500 pt-2 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>Delivering to: {order.customer?.deliveryAddress}</span>
          </div>
        </div>
      )}
    </div>
  );
}
