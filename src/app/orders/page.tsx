'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Clock, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGetOrders } from '@/lib/api';
import type { Order } from '@/lib/types';

export default function OrdersHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      try {
        const data = await apiGetOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/orders');
      } else {
        fetchOrders();
      }
    }
  }, [isAuthenticated, authLoading, router]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'preparing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'dispatched':
      case 'ready':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-36 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">
      <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Your Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track and review past orders</p>
        </div>
        <Link
          href="/catalog"
          className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs px-4 py-2 rounded-full transition"
        >
          Order Food
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4 shadow-2xs">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-base font-bold text-gray-900">No Orders Placed Yet</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven&apos;t ordered any meals yet. Browse your favorite local restaurants to get started!
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow transition"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    {order.restaurant?.name || 'Restaurant Order'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span>ID: #{order.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>
                      {order.timestamps?.createdAt
                        ? new Date(order.timestamps.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recently'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border self-start sm:self-auto tracking-wider ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items Preview */}
              <div className="space-y-1.5 text-xs text-gray-600">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.name} <strong className="text-gray-900">× {it.quantity}</strong>
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₹{it.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total & Action */}
              <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-400 block uppercase font-bold">Total Paid</span>
                  <span className="text-base font-black text-gray-900">
                    ₹{Number(order.pricing?.total || 0).toFixed(2)}
                  </span>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>Track &amp; Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
