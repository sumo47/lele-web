'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Save,
  Loader2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { PartnerRouteGuard } from '@/components/partner/PartnerRouteGuard';
import { PartnerLayout } from '@/components/partner/PartnerLayout';
import {
  apiGetShopCategoryTemplates,
  apiGetMyCustomCategories,
  apiCreateProduct,
} from '@/lib/api';
import type { CategoryTemplate, ShopCustomCategory } from '@/lib/types';

interface VariantFormItem {
  id: string;
  sku: string;
  title: string;
  price: number;
  listingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  attributes: Record<string, string>;
}

export default function NewProductPage() {
  return (
    <PartnerRouteGuard role="shop">
      <NewProductContent />
    </PartnerRouteGuard>
  );
}

function NewProductContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [customCategories, setCustomCategories] = useState<ShopCustomCategory[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryTemplateId, setCategoryTemplateId] = useState('');
  const [customCategoryId, setCustomCategoryId] = useState('');

  // Attributes key-value
  const [productAttributes, setProductAttributes] = useState<Record<string, string>>({});

  // Variants list
  const [variants, setVariants] = useState<VariantFormItem[]>([
    {
      id: 'var-1',
      sku: '',
      title: 'Standard / Default',
      price: 100,
      listingPrice: 120,
      stockQuantity: 10,
      lowStockThreshold: 3,
      attributes: {},
    },
  ]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [tplRes, catRes] = await Promise.allSettled([
          apiGetShopCategoryTemplates(),
          apiGetMyCustomCategories(),
        ]);

        if (tplRes.status === 'fulfilled' && tplRes.value.length > 0) {
          setTemplates(tplRes.value);
          setCategoryTemplateId(tplRes.value[0].id);
        }
        if (catRes.status === 'fulfilled') {
          setCustomCategories(catRes.value);
        }
      } catch (err: any) {
        setErrorMsg('Failed to load category templates.');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const selectedTemplate = templates.find((t) => t.id === categoryTemplateId);

  const handleAddVariant = () => {
    const nextIdx = variants.length + 1;
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}-${nextIdx}`,
        sku: '',
        title: `Variant ${nextIdx}`,
        price: prev[0]?.price || 100,
        listingPrice: prev[0]?.listingPrice || 120,
        stockQuantity: 10,
        lowStockThreshold: 3,
        attributes: {},
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      alert('A product must have at least one variant.');
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (
    id: string,
    field: keyof VariantFormItem,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleUpdateVariantAttr = (
    variantId: string,
    key: string,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              attributes: {
                ...v.attributes,
                [key]: value,
              },
            }
          : v
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    if (!categoryTemplateId) {
      setErrorMsg('Please select a category template.');
      return;
    }

    if (variants.length === 0) {
      setErrorMsg('At least one variant is required.');
      return;
    }

    // Validate variant prices and stock
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (Number(v.price) < 0) {
        setErrorMsg(`Variant ${i + 1} price cannot be negative.`);
        return;
      }
      if (Number(v.stockQuantity) < 0) {
        setErrorMsg(`Variant ${i + 1} stock quantity cannot be negative.`);
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await apiCreateProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        brand: brand.trim() || undefined,
        categoryTemplateId,
        customCategoryId: customCategoryId || undefined,
        imageUrl: imageUrl.trim() || undefined,
        attributes: productAttributes,
        variants: variants.map((v) => ({
          sku: v.sku.trim() || undefined,
          title: v.title.trim() || 'Default',
          price: Number(v.price),
          listingPrice: Number(v.listingPrice) || Number(v.price),
          stockQuantity: Number(v.stockQuantity),
          lowStockThreshold: Number(v.lowStockThreshold) || 5,
          attributes: v.attributes,
        })),
      });

      router.push('/partner/shop/products');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PartnerLayout role="shop" title="Add Product">
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500">Loading category options...</p>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout
      role="shop"
      title="Create New Product"
      subtitle="Define attributes and variant dimensions"
      actions={
        <Link
          href="/partner/shop/products"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Basic Information Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-600" />
            <span>Product Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Product Title / Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pure Cotton Casual Shirt, Wireless Bluetooth Earbuds"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category Template <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryTemplateId}
                onChange={(e) => setCategoryTemplateId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Levi's, Boat, Classmate"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Custom Store Category (Optional)
              </label>
              <select
                value={customCategoryId}
                onChange={(e) => setCustomCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">None (Uncategorized)</option>
                {customCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Product Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/product.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Product Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of features, materials, and warranty..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Dynamic Template Attributes Suggestion */}
          {selectedTemplate && selectedTemplate.suggestedAttributes && selectedTemplate.suggestedAttributes.length > 0 && (
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Suggested Attributes for {selectedTemplate.name}:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedTemplate.suggestedAttributes.map((attrItem: any) => {
                  const attrName = typeof attrItem === 'string' ? attrItem : attrItem.name;
                  const attrLabel = typeof attrItem === 'string' ? attrItem : attrItem.label || attrItem.name;
                  return (
                    <div key={attrName}>
                      <label className="block text-[11px] font-bold text-gray-700 capitalize mb-1">
                        {attrLabel}
                      </label>
                      <input
                        type="text"
                        value={productAttributes[attrName] || ''}
                        onChange={(e) =>
                          setProductAttributes({
                            ...productAttributes,
                            [attrName]: e.target.value,
                          })
                        }
                        placeholder={`e.g. ${attrLabel}`}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Variants Section */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Variants & Inventory</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Every product variant has its own price, SKU, and independent live stock quantity.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, idx) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-700 uppercase">
                    Variant #{idx + 1}
                  </span>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-lg transition"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Variant Title / Option Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={v.title}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, 'title', e.target.value)
                      }
                      placeholder="e.g. Size M, Red 64GB"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      SKU (Optional)
                    </label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, 'sku', e.target.value)
                      }
                      placeholder="SKU-1001"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={v.price}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, 'price', Number(e.target.value))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Listing Price (MRP ₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={v.listingPrice}
                      onChange={(e) =>
                        handleUpdateVariant(
                          v.id,
                          'listingPrice',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-200/60">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Initial Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={v.stockQuantity}
                      onChange={(e) =>
                        handleUpdateVariant(
                          v.id,
                          'stockQuantity',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={v.lowStockThreshold}
                      onChange={(e) =>
                        handleUpdateVariant(
                          v.id,
                          'lowStockThreshold',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  {/* Template Variant Dimension inputs */}
                  {(
                    selectedTemplate?.suggestedVariants ||
                    selectedTemplate?.suggestedVariantDimensions ||
                    []
                  ).map((dimItem: any) => {
                    const dim = typeof dimItem === 'string' ? dimItem : dimItem.name;
                    const dimLabel = typeof dimItem === 'string' ? dimItem : dimItem.label || dimItem.name;
                    return (
                      <div key={dim}>
                        <label className="block text-[11px] font-bold text-gray-700 capitalize mb-1">
                          {dimLabel}
                        </label>
                        <input
                          type="text"
                          value={v.attributes[dim] || ''}
                          onChange={(e) =>
                            handleUpdateVariantAttr(v.id, dim, e.target.value)
                          }
                          placeholder={`e.g. ${dimLabel}`}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Publishing Product...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save and Publish Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </PartnerLayout>
  );
}
