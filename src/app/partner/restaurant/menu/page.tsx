'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  X,
  Tag,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetVendorCatalogItems,
  apiGetVendorCategories,
  apiCreateVendorCatalogItem,
  apiUpdateVendorCatalogItem,
  apiToggleVendorItemAvailability,
  apiDeleteVendorCatalogItem,
  uploadImage,
} from '@/lib/api';
import type { VendorCatalogItem, VendorCategory } from '@/lib/types';

export default function RestaurantMenuPage() {
  return (
    <PartnerRouteGuard role="vendor">
      <RestaurantMenuContent />
    </PartnerRouteGuard>
  );
}

function RestaurantMenuContent() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<VendorCatalogItem[]>([]);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Item Modal State (Create / Edit)
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VendorCatalogItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formListingPrice, setFormListingPrice] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formInStock, setFormInStock] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  // Delete Confirm Modal State
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCatalogData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [itemsRes, catsRes] = await Promise.allSettled([
        apiGetVendorCatalogItems(),
        apiGetVendorCategories(),
      ]);

      if (itemsRes.status === 'fulfilled') {
        setItems(itemsRes.value || []);
      }
      if (catsRes.status === 'fulfilled') {
        setCategories(catsRes.value || []);
      }
    } catch (err: any) {
      console.error('Failed to load menu catalog:', err);
      setToastMsg({ type: 'error', text: err?.message || 'Failed to load menu catalog.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      // Diet filter
      if (dietFilter === 'veg' && !item.isVeg) return false;
      if (dietFilter === 'non-veg' && item.isVeg) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.name.toLowerCase().includes(q);
        const descMatch = item.description?.toLowerCase().includes(q);
        if (!nameMatch && !descMatch) return false;
      }

      return true;
    });
  }, [items, selectedCategory, dietFilter, searchQuery]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormListingPrice('');
    setFormCategoryId(categories[0]?.id || '');
    setFormIsVeg(true);
    setFormInStock(true);
    setFormImageUrl('');
    setItemModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item: VendorCatalogItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setFormPrice(String(item.price));
    setFormListingPrice(item.listingPrice ? String(item.listingPrice) : '');
    setFormCategoryId(item.categoryId || categories[0]?.id || '');
    setFormIsVeg(item.isVeg);
    setFormInStock(item.inStock !== false);
    setFormImageUrl(item.imageUrl || '');
    setItemModalOpen(true);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadImage({ file, purpose: 'product' });
      setFormImageUrl(res.secureUrl);
      setToastMsg({ type: 'success', text: 'Dish photo uploaded successfully!' });
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to upload photo.' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setToastMsg({ type: 'error', text: 'Please enter a dish name.' });
      return;
    }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setToastMsg({ type: 'error', text: 'Please enter a valid price.' });
      return;
    }

    setSavingItem(true);
    setToastMsg(null);

    const payload = {
      name: formName.trim(),
      description: formDescription.trim(),
      price: priceNum,
      listingPrice: formListingPrice ? parseFloat(formListingPrice) : undefined,
      categoryId: formCategoryId || undefined,
      isVeg: formIsVeg,
      inStock: formInStock,
      isAvailable: formInStock,
      imageUrl: formImageUrl || undefined,
    };

    try {
      if (editingItem) {
        await apiUpdateVendorCatalogItem(editingItem.id, payload);
        setToastMsg({ type: 'success', text: `Dish "${formName}" updated successfully!` });
      } else {
        await apiCreateVendorCatalogItem(payload);
        setToastMsg({ type: 'success', text: `Dish "${formName}" created and added to menu!` });
      }
      setItemModalOpen(false);
      await fetchCatalogData(true);
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to save dish.' });
    } finally {
      setSavingItem(false);
    }
  };

  // Toggle in-stock switch
  const handleToggleStock = async (item: VendorCatalogItem) => {
    const nextStock = !item.inStock;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, inStock: nextStock, isAvailable: nextStock } : i))
    );

    try {
      await apiToggleVendorItemAvailability(item.id, nextStock);
      setToastMsg({
        type: 'success',
        text: `"${item.name}" marked as ${nextStock ? 'IN STOCK' : 'OUT OF STOCK'}.`,
      });
    } catch (err: any) {
      // Rollback
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, inStock: !nextStock, isAvailable: !nextStock } : i))
      );
      setToastMsg({ type: 'error', text: err?.message || 'Failed to update stock status.' });
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!deletingItemId) return;
    const itemToDelete = items.find((i) => i.id === deletingItemId);

    try {
      await apiDeleteVendorCatalogItem(deletingItemId);
      setToastMsg({
        type: 'success',
        text: `Dish "${itemToDelete?.name || 'Item'}" removed from menu.`,
      });
      setDeletingItemId(null);
      await fetchCatalogData(true);
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Failed to delete dish.' });
    }
  };

  return (
    <PartnerLayout
      role="restaurant"
      title="Menu & Dish Catalog"
      subtitle="Add new dishes, update prices, and quickly mark items in-stock or out-of-stock."
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dish</span>
          </button>
          <button
            onClick={() => fetchCatalogData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 transition cursor-pointer"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
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
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Categories ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Diet Toggle & Search */}
          <div className="flex items-center gap-3">
            {/* Veg / Non-Veg Toggle */}
            <div className="flex items-center p-0.5 bg-gray-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setDietFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  dietFilter === 'all' ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter('veg')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                  dietFilter === 'veg' ? 'bg-white shadow-2xs text-emerald-700' : 'text-gray-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Veg
              </button>
              <button
                onClick={() => setDietFilter('non-veg')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                  dietFilter === 'non-veg' ? 'bg-white shadow-2xs text-red-700' : 'text-gray-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500" /> Non-Veg
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-44 sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish name..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Dish Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
          <p className="text-sm font-semibold text-gray-600">Loading dishes from kitchen catalog...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-bold text-gray-800">No Dishes Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No dishes matching "${searchQuery}".`
              : 'Add your delicious dishes to start receiving orders.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition"
          >
            <Plus className="w-4 h-4" /> Add First Dish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const inStock = item.inStock !== false;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all overflow-hidden flex flex-col justify-between ${
                  !inStock ? 'opacity-70 bg-gray-50/50' : ''
                }`}
              >
                <div>
                  {/* Dish Image */}
                  <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <UtensilsCrossed className="w-10 h-10" />
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs ${
                          inStock ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-white'
                        }`}
                      >
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-3 right-3 bg-white/95 p-1 rounded-md shadow-2xs">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${
                          item.isVeg ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500 border-red-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                        {item.name}
                      </h3>
                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-gray-900">
                          ₹{Math.round(item.price)}
                        </span>
                        {item.listingPrice && item.listingPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through block font-medium">
                            ₹{Math.round(item.listingPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {item.categoryName && (
                      <span className="inline-block text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mt-1">
                        {item.categoryName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 bg-gray-50/30">
                  {/* Stock Toggle Switch */}
                  <button
                    onClick={() => handleToggleStock(item)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 cursor-pointer"
                  >
                    {inStock ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                    <span>{inStock ? 'Available' : 'Unavailable'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                      title="Edit Dish"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingItemId(item.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dish Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Edit Dish' : 'Add New Dish to Menu'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Dish Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Chicken Dum Biryani (Full)"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Price & Listing Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="220"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Original Price (₹) <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formListingPrice}
                    onChange={(e) => setFormListingPrice(e.target.value)}
                    placeholder="260"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              {/* Category & Diet */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Menu Category
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Food Preference *
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setFormIsVeg(true)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition ${
                        formIsVeg
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-2xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormIsVeg(false)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition ${
                        !formIsVeg
                          ? 'bg-red-50 text-red-700 border-red-400 shadow-2xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dish Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ingredients, preparation style, portion size..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dish Photo
                </label>
                <div className="flex items-center gap-3">
                  {formImageUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                      <Image src={formImageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    />
                    {uploadingImage && (
                      <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading image to CDN...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingItem || uploadingImage}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {savingItem ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItemId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Delete Dish</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove this dish from your kitchen catalog? It will no longer be visible to customers.
            </p>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingItemId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
