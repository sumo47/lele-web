'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  MapPin,
  Phone,
  Truck,
  RotateCcw,
  Bike,
  Star,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  X,
  Search,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { apiGetShopDetails, apiGetShopProducts } from '@/lib/api';
import type { ShopProfile, ShopProduct, ShopCustomCategory, ProductVariant } from '@/lib/types';

export default function ShopDetailsPage() {
  const params = useParams();
  const shopId = params?.id as string;
  const { addToCart, items: cartItems } = useCart();

  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [categories, setCategories] = useState<ShopCustomCategory[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Variant Selection Modal State
  const [activeProduct, setActiveProduct] = useState<ShopProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const loadData = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const res = await apiGetShopDetails(shopId);
      if (res) {
        setShop(res.shop || res);
        setCategories(res.categories || []);
        setProducts(res.products || []);
      }
    } catch (err: any) {
      console.error('Failed to load shop details:', err);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenVariantModal = (product: ShopProduct) => {
    setActiveProduct(product);
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setAddedSuccess(false);
  };

  const handleAddToCart = async () => {
    if (!activeProduct || !selectedVariant || !shop) return;
    if (selectedVariant.stockQuantity <= 0) return;

    await addToCart(
      {
        id: selectedVariant.id,
        restaurantId: shop.id,
        name: `${activeProduct.name}${
          selectedVariant.title && selectedVariant.title !== 'Default'
            ? ` (${selectedVariant.title})`
            : ''
        }`,
        price: selectedVariant.price,
        imageUrl:
          selectedVariant.imageUrl ||
          activeProduct.imageUrl ||
          (activeProduct.images && activeProduct.images[0]) ||
          '',
        isVeg: true,
      },
      shop.name
    );

    setAddedSuccess(true);
    setTimeout(() => {
      setActiveProduct(null);
      setSelectedVariant(null);
      setAddedSuccess(false);
    }, 600);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryId === 'all' || p.customCategoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">Loading store catalog...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xl space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Shop Not Found</h2>
          <p className="text-xs text-gray-600">
            The requested store profile does not exist or may have been deactivated.
          </p>
          <Link
            href="/shops"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            Explore Other Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/shops"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Stores</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                shop.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {shop.isOpen ? 'Store Open' : 'Store Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* Store Banner & Info Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-purple-50 border border-purple-100 overflow-hidden shrink-0 shadow-sm">
                {shop.imageUrl ? (
                  <Image src={shop.imageUrl} alt={shop.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    {shop.name}
                  </h1>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {shop.shopCategory}
                  </span>
                </div>

                {shop.description && (
                  <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
                    {shop.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{shop.location || shop.address || 'Nirmali Bazar'}</span>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Badges Column */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
              {shop.selfDeliveryEnabled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold border border-purple-100">
                  <Truck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Seller Self-Delivery</span>
                </span>
              )}
              {shop.riderDeliveryEnabled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
                  <Bike className="w-3.5 h-3.5 text-blue-600" />
                  <span>LELE Fleet Delivery</span>
                </span>
              )}
              {shop.returnPolicyEnabled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-100">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>{shop.returnWindowHours || 24}h Return / Exchange</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog & Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Category Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategoryId === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Items ({products.length})
            </button>

            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategoryId === c.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 p-8">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">No products available</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              There are no products listed in this section at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((p) => {
              const prices = p.variants?.map((v) => v.price) || [p.basePrice || 0];
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const totalStock =
                p.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;
              const isOutOfStock = totalStock <= 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
                      {p.imageUrl || (p.images && p.images[0]) ? (
                        <Image
                          src={p.imageUrl || p.images[0]}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}

                      {/* Out of stock badge */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center">
                          <span className="px-3 py-1 bg-red-600 text-white text-[11px] font-black uppercase rounded-full shadow-md">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Variant count pill */}
                      {p.variants && p.variants.length > 1 && (
                        <div className="absolute bottom-2 right-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs">
                            {p.variants.length} Options
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2">
                      <div>
                        {p.brand && (
                          <span className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wider">
                            {p.brand}
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mt-0.5">
                          {p.name}
                        </h3>
                      </div>

                      {p.description && (
                        <p className="text-[11px] text-gray-500 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Add Action */}
                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 font-medium block">Price</span>
                        <p className="text-sm font-black text-gray-900">
                          ₹{minPrice}
                          {minPrice !== maxPrice ? ` - ₹${maxPrice}` : ''}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenVariantModal(p)}
                        disabled={isOutOfStock || !shop.isOpen}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                          isOutOfStock || !shop.isOpen
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{p.variants && p.variants.length > 1 ? 'Options' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Variant Selector Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                {activeProduct.brand && (
                  <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                    {activeProduct.brand}
                  </span>
                )}
                <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                  {activeProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Product Preview Header */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  {selectedVariant?.imageUrl || activeProduct.imageUrl ? (
                    <Image
                      src={selectedVariant?.imageUrl || activeProduct.imageUrl || ''}
                      alt={activeProduct.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900">
                      ₹{selectedVariant?.price ?? activeProduct.basePrice}
                    </span>
                    {selectedVariant?.listingPrice &&
                      selectedVariant.listingPrice > selectedVariant.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{selectedVariant.listingPrice}
                        </span>
                      )}
                  </div>

                  {/* Stock Indicator */}
                  {selectedVariant && (
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {selectedVariant.stockQuantity > 0 ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            In Stock{' '}
                            {selectedVariant.stockQuantity <= 5 &&
                              `(${selectedVariant.stockQuantity} left!)`}
                          </span>
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Out of Stock</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Variant Dimensions Choice */}
              {activeProduct.variants && activeProduct.variants.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Select Option / Dimension ({activeProduct.variants.length} available):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeProduct.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      const isOut = v.stockQuantity <= 0;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          disabled={isOut}
                          className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-600/20'
                              : isOut
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <div>
                            <p
                              className={`text-xs font-bold ${
                                isSelected ? 'text-purple-900' : 'text-gray-900'
                              }`}
                            >
                              {v.title}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {isOut ? 'Out of stock' : `${v.stockQuantity} in stock`}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-black ${
                              isSelected ? 'text-purple-700' : 'text-gray-900'
                            }`}
                          >
                            ₹{v.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Add to Cart */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleAddToCart}
                disabled={
                  !selectedVariant ||
                  selectedVariant.stockQuantity <= 0 ||
                  addedSuccess ||
                  !shop.isOpen
                }
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-xs shadow-lg transition ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : !selectedVariant || selectedVariant.stockQuantity <= 0 || !shop.isOpen
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : !shop.isOpen ? (
                  <span>Store is currently closed</span>
                ) : !selectedVariant || selectedVariant.stockQuantity <= 0 ? (
                  <span>Option Out of Stock</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • ₹{selectedVariant.price}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
