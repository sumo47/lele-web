'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Package,
  Layers,
  FileText,
  X,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetMyShopReturns,
  apiReviewShopReturn,
} from '@/lib/api';
import type { ReturnRequest } from '@/lib/types';

export default function ShopReturnsPage() {
  return (
    <PartnerRouteGuard role="shop">
      <ShopReturnsContent />
    </PartnerRouteGuard>
  );
}

function ShopReturnsContent() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'requested' | 'approved' | 'completed' | 'rejected'>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  // Review Form
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'completed'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [sellerNotes, setSellerNotes] = useState('');
  const [restockVariant, setRestockVariant] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadReturns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetMyShopReturns();
      setReturns(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to load return requests.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  const openReviewModal = (r: ReturnRequest) => {
    setSelectedReturn(r);
    const isPending = r.status === 'requested' || r.status === 'pending';
    setDecision(isPending ? 'approved' : r.status === 'approved' ? 'completed' : 'approved');
    setRejectionReason('');
    setSellerNotes('');
    setRestockVariant(true);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    if (decision === 'rejected' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejecting this return request.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const updated = await apiReviewShopReturn(selectedReturn.id, {
        status: decision,
        rejectionReason: decision === 'rejected' ? rejectionReason.trim() : undefined,
        sellerNotes: sellerNotes.trim() || undefined,
        restockItems: decision === 'completed' ? restockVariant : undefined,
      });

      setReturns((prev) =>
        prev.map((r) => (r.id === selectedReturn.id ? { ...r, ...updated } : r))
      );

      setFeedback({
        type: 'success',
        text: `Return request #${selectedReturn.id.slice(0, 8)} status marked as ${decision.toUpperCase()}.`,
      });
      setReviewModalOpen(false);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Failed to update return request.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReturns = returns.filter((r) => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  return (
    <PartnerLayout
      role="shop"
      title="Returns & Exchanges"
      subtitle="Review customer return requests within the 24-hour delivery window"
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

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl shadow-2xs w-full sm:w-auto overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Requests' },
              { id: 'requested', label: 'Pending Review' },
              { id: 'approved', label: 'Approved' },
              { id: 'completed', label: 'Completed & Restocked' },
              { id: 'rejected', label: 'Rejected' },
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

        {/* Returns Table */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Loading returns...</p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
            <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">No return requests</h3>
            <p className="text-xs text-gray-500 mt-1">
              There are no customer return or exchange requests in this status.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-900 bg-purple-50 px-2 py-0.5 rounded-full">
                        {r.type || r.requestType} Request
                      </span>
                      <span className="font-mono text-xs font-bold text-gray-900">
                        Order #{r.orderNumber || r.orderId.slice(0, 8)}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          r.status === 'requested' || r.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : r.status === 'approved'
                            ? 'bg-blue-50 text-blue-700'
                            : r.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono mt-1">
                      Submitted: {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => openReviewModal(r)}
                    className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition shrink-0 self-start sm:self-auto"
                  >
                    Review / Update Decision
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50/70 p-4 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-700">Reason for {r.type || r.requestType}:</p>
                    <p className="text-gray-900 font-semibold mt-0.5 capitalize">
                      {r.reason.replace(/_/g, ' ')}
                    </p>
                    {(r.customerNotes || r.description) && (
                      <p className="text-gray-600 mt-1 italic">&quot;{r.customerNotes || r.description}&quot;</p>
                    )}
                  </div>

                  <div>
                    {r.rejectionReason && (
                      <div className="mb-2">
                        <p className="font-bold text-red-700">Rejection Reason:</p>
                        <p className="text-red-900 mt-0.5">{r.rejectionReason}</p>
                      </div>
                    )}
                    {r.sellerNotes && (
                      <div>
                        <p className="font-bold text-gray-700">Seller Notes:</p>
                        <p className="text-gray-600 mt-0.5">{r.sellerNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  Review {(selectedReturn.type || selectedReturn.requestType).toUpperCase()} Request
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Order #{selectedReturn.orderNumber || selectedReturn.orderId.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Decision <span className="text-red-500">*</span>
                </label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="approved">Approve Return / Exchange</option>
                  <option value="completed">Complete & Finalize</option>
                  <option value="rejected">Reject Request</option>
                </select>
              </div>

              {decision === 'rejected' && (
                <div>
                  <label className="block text-xs font-bold text-red-700 mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear reason for the rejection..."
                    className="w-full px-3.5 py-2 rounded-xl border border-red-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {decision === 'completed' && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/70 border border-purple-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restockVariant}
                    onChange={(e) => setRestockVariant(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900">
                      Restock Items in Inventory
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      Automatically increments product variant live stock and writes an audit log.
                    </span>
                  </div>
                </label>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Seller Notes (Optional)
                </label>
                <input
                  type="text"
                  value={sellerNotes}
                  onChange={(e) => setSellerNotes(e.target.value)}
                  placeholder="Internal notes or customer instructions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Decision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
