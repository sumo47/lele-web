'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  FolderTree,
  CheckCircle2,
  X,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetMyCustomCategories,
  apiCreateCustomCategory,
  apiUpdateCustomCategory,
  apiDeleteCustomCategory,
} from '@/lib/api';
import type { ShopCustomCategory } from '@/lib/types';

export default function ShopCustomCategoriesPage() {
  return (
    <PartnerRouteGuard role="shop">
      <CustomCategoriesContent />
    </PartnerRouteGuard>
  );
}

function CustomCategoriesContent() {
  const [categories, setCategories] = useState<ShopCustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ShopCustomCategory | null>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetMyCustomCategories();
      setCategories(data || []);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to load custom categories.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: ShopCustomCategory) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setFeedback(null);

    try {
      if (editingCat) {
        const updated = await apiUpdateCustomCategory(editingCat.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          isActive,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCat.id ? updated : c))
        );
        setFeedback({ type: 'success', text: `Category "${updated.name}" updated successfully.` });
      } else {
        const created = await apiCreateCustomCategory({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        setCategories((prev) => [...prev, created]);
        setFeedback({ type: 'success', text: `Category "${created.name}" created successfully.` });
      }
      setModalOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to save custom category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
      return;
    }

    setDeletingId(id);
    try {
      await apiDeleteCustomCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setFeedback({ type: 'success', text: 'Category deleted successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to delete category.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PartnerLayout
      role="shop"
      title="Custom Categories"
      subtitle="Organize your shop products into custom sections"
      actions={
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Category</span>
        </button>
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

        {/* Note banner */}
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
          <FolderTree className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs text-purple-900 leading-relaxed">
            <span className="font-bold">Store-Scoped Taxonomy:</span> Custom categories created here belong exclusively to your shop storefront. They allow customers to browse your products by your own chosen sections (e.g. &quot;Summer Sale&quot;, &quot;Fiction Novels&quot;, &quot;Party Wear&quot;).
          </div>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Loading custom categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">No custom categories yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Group your products into convenient aisles or sections for your local customers.
            </p>
            <div className="mt-4">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {c.description || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                        title="Delete category"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-900">
                {editingCat ? 'Edit Custom Category' : 'New Custom Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Collection, School Stationery"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional note about items in this section..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {editingCat && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-xs font-bold text-gray-700">Category Active</span>
                </label>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCat ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
