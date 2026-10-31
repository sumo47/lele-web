'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetMyProducts,
  apiGetMyCustomCategories,
  apiUpdateProduct,
  apiDeleteProduct,
} from '@/lib/api';
import type { ShopProduct, ShopCustomCategory } from '@/lib/types';

export default function ShopProductsPage() {
  return (
    <PartnerRouteGuard role="shop">
      <ShopProductsContent />
    </PartnerRouteGuard>
  );
}

function ShopProductsContent() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [customCategories, setCustomCategories] = useState<ShopCustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        apiGetMyProducts(),
        apiGetMyCustomCategories(),
      ]);

      if (prodRes.status === 'fulfilled') {
        const pVal = prodRes.value;
        setProducts(Array.isArray(pVal) ? pVal : (pVal?.products || []));
      }
      if (catRes.status === 'fulfilled') {
        setCustomCategories(catRes.value || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to load products.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleActive = async (p: ShopProduct) => {
    const nextStatus = !p.isActive;
    try {
      await apiUpdateProduct(p.id, { isActive: nextStatus });
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, isActive: nextStatus } : item))
      );
      setFeedback({
        type: 'success',
        text: `Product "${p.name}" is now ${nextStatus ? 'ACTIVE (visible to customers)' : 'INACTIVE (hidden)'}`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to update product status.' });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product and all its variants?')) {
      return;
    }

    setDeletingId(productId);
    try {
      await apiDeleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setFeedback({ type: 'success', text: 'Product deleted successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to delete product.' });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat =
      selectedCatId === 'all' || p.customCategoryId === selectedCatId;
    return matchesSearch && matchesCat;
  });

  return (
    <PartnerLayout
      role="shop"
      title="Products & Variants"
      subtitle="Manage your catalog, prices, and variant dimensions"
      actions={
        <Link
          href="/partner/shop/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      }
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

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title or brand..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>

          <div className="w-full sm:w-60">
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="all">All Custom Categories</option>
              {customCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products List / Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Loading catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCatId !== 'all'
                ? 'Try adjusting your search query or category filter.'
                : 'Get started by creating your first product with customized attributes and variants.'}
            </p>
            <div className="mt-4">
              <Link
                href="/partner/shop/products/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Product</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const variantCount = p.variants?.length || 0;
              const prices = p.variants?.map((v) => v.price) || [p.basePrice || 0];
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const totalStock =
                p.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        {p.imageUrl || (p.images && p.images[0]) ? (
                          <Image
                            src={p.imageUrl || p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                            {p.categoryTemplateName || p.categoryTemplateSlug || 'General'}
                          </span>
                          <button
                            onClick={() => handleToggleActive(p)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                              p.isActive
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {p.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 truncate mt-1">
                          {p.name}
                        </h3>
                        {p.brand && (
                          <p className="text-[11px] text-gray-500 font-medium">{p.brand}</p>
                        )}
                        {p.customCategoryName && (
                          <p className="text-[10px] text-purple-600 font-semibold mt-0.5">
                            Category: {p.customCategoryName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price and Variants summary */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400 font-medium">Price</span>
                        <p className="text-sm font-black text-gray-900">
                          ₹{minPrice}
                          {minPrice !== maxPrice ? ` - ₹${maxPrice}` : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-400 font-medium">Variants</span>
                        <p className="text-xs font-bold text-gray-700 flex items-center gap-1 justify-end">
                          <Layers className="w-3 h-3 text-purple-600" />
                          <span>{variantCount} variant(s)</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-400 font-medium">Stock</span>
                        <p
                          className={`text-xs font-black ${
                            totalStock <= 5 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {totalStock} in stock
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/partner/shop/products/${p.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit & Variants</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete Product"
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
