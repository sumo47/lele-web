'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  History,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetMyProducts,
  apiAdjustInventory,
  apiGetInventoryLogs,
} from '@/lib/api';
import type { ShopProduct, ProductVariant, InventoryLog } from '@/lib/types';

interface FlattenedVariant {
  productId: string;
  productName: string;
  variantId: string;
  title: string;
  sku?: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

export default function ShopInventoryPage() {
  return (
    <PartnerRouteGuard role="shop">
      <ShopInventoryContent />
    </PartnerRouteGuard>
  );
}

function ShopInventoryContent() {
  const [variants, setVariants] = useState<FlattenedVariant[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<FlattenedVariant | null>(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [reason, setReason] = useState<'restock' | 'manual_adjustment' | 'damaged' | 'audit_correction'>('restock');
  const [notes, setNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, logRes] = await Promise.allSettled([
        apiGetMyProducts(),
        apiGetInventoryLogs(),
      ]);

      if (prodRes.status === 'fulfilled') {
        const flat: FlattenedVariant[] = [];
        const pList = Array.isArray(prodRes.value) ? prodRes.value : (prodRes.value?.products || []);
        for (const p of pList) {
          if (p.variants && p.variants.length > 0) {
            for (const v of p.variants) {
              flat.push({
                productId: p.id,
                productName: p.name,
                variantId: v.id,
                title: v.title,
                sku: v.sku,
                price: v.price,
                stockQuantity: v.stockQuantity,
                lowStockThreshold: v.lowStockThreshold || 5,
              });
            }
          }
        }
        setVariants(flat);
      }

      if (logRes.status === 'fulfilled') {
        setLogs(logRes.value || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to load inventory data.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAdjustModal = (v: FlattenedVariant) => {
    setSelectedVariant(v);
    setNewQuantity(v.stockQuantity);
    setReason('restock');
    setNotes('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    setAdjusting(true);
    setFeedback(null);

    try {
      const res = await apiAdjustInventory(selectedVariant.variantId, {
        newQuantity: Number(newQuantity),
        reason,
        notes: notes.trim() || undefined,
      });

      // Update variant stock in local state
      setVariants((prev) =>
        prev.map((v) =>
          v.variantId === selectedVariant.variantId
            ? { ...v, stockQuantity: res.variant.stockQuantity }
            : v
        )
      );

      // Refresh audit logs
      const latestLogs = await apiGetInventoryLogs();
      setLogs(latestLogs);

      setFeedback({
        type: 'success',
        text: `Stock for "${selectedVariant.productName} - ${selectedVariant.title}" adjusted to ${res.variant.stockQuantity}.`,
      });
      setAdjustModalOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to adjust stock.' });
    } finally {
      setAdjusting(false);
    }
  };

  // Filter
  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      v.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.sku && v.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLowStock = filterLowStockOnly
      ? v.stockQuantity <= v.lowStockThreshold
      : true;

    return matchesSearch && matchesLowStock;
  });

  return (
    <PartnerLayout
      role="shop"
      title="Inventory & Stock"
      subtitle="Real-time live variant inventory and audit logs"
    >
      <div className="space-y-8">
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

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, variant title, or SKU..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white cursor-pointer text-xs font-bold text-gray-700 shrink-0">
            <input
              type="checkbox"
              checked={filterLowStockOnly}
              onChange={(e) => setFilterLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Show Low Stock Only</span>
          </label>
        </div>

        {/* Live Variant Stock Table */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-gray-900">
                Variant Inventory ({filteredVariants.length})
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500">Loading variant inventory...</p>
            </div>
          ) : filteredVariants.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-xs">No product variants match the filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-3.5">Product & Variant</th>
                    <th className="px-6 py-3.5">SKU</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Live Stock</th>
                    <th className="px-6 py-3.5">Threshold</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVariants.map((v) => {
                    const isLow = v.stockQuantity <= v.lowStockThreshold;
                    const isOut = v.stockQuantity <= 0;
                    return (
                      <tr key={v.variantId} className="hover:bg-gray-50/70 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{v.productName}</p>
                          <p className="text-gray-500 text-[11px]">{v.title}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600">
                          {v.sku || '—'}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          ₹{v.price}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-black ${
                                isOut
                                  ? 'text-red-600'
                                  : isLow
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {v.stockQuantity}
                            </span>
                            {isOut ? (
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-700">
                                Low Stock
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {v.lowStockThreshold}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openAdjustModal(v)}
                            className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-gray-900">
                Inventory Audit Trail ({logs.length} Recent Events)
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Variant</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Previous</th>
                  <th className="px-6 py-3.5">New</th>
                  <th className="px-6 py-3.5">Change</th>
                  <th className="px-6 py-3.5">Order / Ref</th>
                  <th className="px-6 py-3.5 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No inventory movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{log.variantTitle || 'Variant'}</p>
                        {log.sku && <p className="font-mono text-[10px] text-gray-400">{log.sku}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-gray-700 capitalize">
                          {log.reason.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">{log.previousQuantity}</td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">{log.newQuantity}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-mono font-bold ${
                            log.changeAmount > 0
                              ? 'text-emerald-600'
                              : log.changeAmount < 0
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-500">
                        {log.orderNumber ? `#${log.orderNumber}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Adjust Inventory Stock</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedVariant.productName} ({selectedVariant.title})
                </p>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-600">Current Stock:</span>
                <span className="font-bold text-gray-900 font-mono text-sm">
                  {selectedVariant.stockQuantity} units
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  New Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[11px] text-gray-400 mt-1 font-mono">
                  Change: {newQuantity - selectedVariant.stockQuantity >= 0 ? '+' : ''}
                  {newQuantity - selectedVariant.stockQuantity} units
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason for Adjustment <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="restock">New Stock Inward / Restock</option>
                  <option value="manual_adjustment">Manual Adjustment</option>
                  <option value="damaged">Damaged / Expired / Written Off</option>
                  <option value="audit_correction">Audit Physical Count Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notes / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Supplier PO #4092 or damage inspection"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {adjusting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Record Stock Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
