'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { CartItem, MenuItem, Coupon, BusinessPricing } from '@/lib/types';
import { useAuth } from './AuthContext';
import {
  apiGetCart,
  apiAddToCart,
  apiUpdateCartItem,
  apiRemoveCartItem,
  apiClearCart,
  validateCoupon,
  getPublicConfig,
  getBusinessPricing,
} from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (
    item: MenuItem | { id: string; restaurantId: string; name: string; price: number; imageUrl?: string | null; isVeg?: boolean },
    restName?: string
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  appliedCoupon: {
    code: string;
    discountAmount: number;
    discountType: string;
  } | null;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCouponCode: () => void;
  subtotal: number;
  deliveryFee: number;
  convenienceFee: number;
  freeDeliveryThreshold: number;
  minOrderValue?: number;
  isConvenienceFeeEnabled: boolean;
  businessPricing?: BusinessPricing | null;
  refreshPricingConfig: () => Promise<void>;
  discount: number;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'lele_local_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);

  // Dynamic operational pricing configuration loaded from backend
  const [pricingConfig, setPricingConfig] = useState<{
    deliveryFeeEnabled: boolean;
    defaultDeliveryFee: number;
    defaultConvenienceFee: number;
    freeDeliveryMinOrderValue: number;
    minOrderValue: number | null;
    isConvenienceFeeEnabled: boolean;
  }>({
    deliveryFeeEnabled: true,
    defaultDeliveryFee: 15,
    defaultConvenienceFee: 3,
    freeDeliveryMinOrderValue: 149,
    minOrderValue: null,
    isConvenienceFeeEnabled: true,
  });

  const [businessPricing, setBusinessPricing] = useState<BusinessPricing | null>(null);

  // Synchronize per-business pricing whenever the active restaurantId changes
  useEffect(() => {
    let ignore = false;
    if (!restaurantId) {
      setBusinessPricing(null);
      return;
    }

    getBusinessPricing(restaurantId)
      .then(bp => {
        if (!ignore && bp) {
          setBusinessPricing(bp);
        }
      })
      .catch(err => {
        console.warn('Failed to load business pricing, using global defaults:', err);
      });

    return () => {
      ignore = true;
    };
  }, [restaurantId]);

  const refreshPricingConfig = useCallback(async () => {
    try {
      const cfg = await getPublicConfig();
      if (cfg) {
        const rawMinOrder = typeof cfg.restaurantMinOrderValue === 'number'
          ? cfg.restaurantMinOrderValue
          : (typeof cfg.minOrderValue === 'number' ? cfg.minOrderValue : undefined);

        const feeEnabled = cfg.foodDeliveryFeeEnabled !== undefined
          ? cfg.foodDeliveryFeeEnabled
          : true;

        const feeAmount = typeof cfg.foodDeliveryFee === 'number'
          ? cfg.foodDeliveryFee
          : (typeof cfg.defaultRestaurantDeliveryFee === 'number'
              ? cfg.defaultRestaurantDeliveryFee
              : (typeof cfg.defaultDeliveryFee === 'number' ? cfg.defaultDeliveryFee : 15));

        const freeThreshold = typeof cfg.foodFreeDeliveryThreshold === 'number'
          ? cfg.foodFreeDeliveryThreshold
          : (typeof cfg.restaurantFreeDeliveryMinOrderValue === 'number'
              ? cfg.restaurantFreeDeliveryMinOrderValue
              : (typeof cfg.freeDeliveryMinOrderValue === 'number' ? cfg.freeDeliveryMinOrderValue : 149));

        const convEnabled = cfg.foodConvenienceFeeEnabled !== undefined
          ? cfg.foodConvenienceFeeEnabled
          : (cfg.isConvenienceFeeEnabled !== false);

        const convAmount = typeof cfg.foodConvenienceFee === 'number'
          ? cfg.foodConvenienceFee
          : (typeof cfg.defaultConvenienceFee === 'number' ? cfg.defaultConvenienceFee : 3);

        setPricingConfig({
          deliveryFeeEnabled: feeEnabled,
          defaultDeliveryFee: feeAmount,
          defaultConvenienceFee: convAmount,
          freeDeliveryMinOrderValue: freeThreshold,
          minOrderValue: typeof rawMinOrder === 'number' ? rawMinOrder : 99,
          isConvenienceFeeEnabled: convEnabled,
        });
      }
    } catch (err) {
      console.warn('Failed to load public config for cart pricing, using safe defaults:', err);
    }
  }, []);

  // Fetch operational pricing config on mount
  useEffect(() => {
    refreshPricingConfig();
  }, [refreshPricingConfig]);

  // Load from local storage initially
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          setItems(parsed.items);
          setRestaurantId(parsed.restaurantId || null);
          setRestaurantName(parsed.restaurantName || null);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ items, restaurantId, restaurantName })
      );
    } catch {
      // Ignore storage errors
    }
  }, [items, restaurantId, restaurantName]);

  // Synchronize with backend when user is authenticated
  const syncWithBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const backendCart = await apiGetCart();
      if (backendCart && Array.isArray(backendCart.items)) {
        if (backendCart.items.length > 0) {
          setItems(backendCart.items);
          setRestaurantId(backendCart.restaurantId || null);
          setRestaurantName(backendCart.restaurant?.name || null);
        } else if (items.length > 0) {
          // Push guest cart items to backend
          for (const it of items) {
            await apiAddToCart({ itemId: it.itemId, quantity: it.quantity }).catch(() => {});
          }
        }
      }
    } catch {
      // Fallback to local cart if network error
    }
  }, [isAuthenticated, items]);

  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Add Item
  const addToCart = async (
    item: MenuItem | { id: string; restaurantId: string; name: string; price: number; imageUrl?: string | null; isVeg?: boolean },
    restName?: string
  ) => {
    // If cart has items from another restaurant, reset cart with new restaurant
    let currentItems = [...items];
    if (restaurantId && restaurantId !== item.restaurantId && currentItems.length > 0) {
      currentItems = [];
    }

    const existingIndex = currentItems.findIndex((it) => it.itemId === item.id);
    if (existingIndex > -1) {
      currentItems[existingIndex].quantity += 1;
    } else {
      currentItems.push({
        itemId: item.id,
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl || '',
        isVeg: item.isVeg ?? true,
        restaurantId: item.restaurantId,
      });
    }

    setItems(currentItems);
    setRestaurantId(item.restaurantId);
    if (restName) setRestaurantName(restName);

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await apiAddToCart({ itemId: item.id, quantity: 1 });
      } catch (err) {
        console.error('Failed to sync item to backend cart:', err);
      }
    }

    setIsCartOpen(true);
  };

  // Update Quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const updated = items.map((it) =>
      it.itemId === itemId ? { ...it, quantity } : it
    );
    setItems(updated);

    if (isAuthenticated) {
      try {
        await apiUpdateCartItem(itemId, quantity);
      } catch (err) {
        console.error('Failed to update quantity on backend:', err);
      }
    }
  };

  // Remove Item
  const removeFromCart = async (itemId: string) => {
    const filtered = items.filter((it) => it.itemId !== itemId);
    setItems(filtered);

    if (filtered.length === 0) {
      setRestaurantId(null);
      setRestaurantName(null);
      setAppliedCoupon(null);
    }

    if (isAuthenticated) {
      try {
        await apiRemoveCartItem(itemId);
      } catch (err) {
        console.error('Failed to remove item on backend:', err);
      }
    }
  };

  // Clear Cart
  const clearCart = async () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setAppliedCoupon(null);

    if (isAuthenticated) {
      try {
        await apiClearCart();
      } catch (err) {
        console.error('Failed to clear cart on backend:', err);
      }
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [items]);

  const effectiveFreeDeliveryThreshold = (businessPricing?.freeDeliveryMinOrderValue !== null && businessPricing?.freeDeliveryMinOrderValue !== undefined)
    ? businessPricing.freeDeliveryMinOrderValue
    : pricingConfig.freeDeliveryMinOrderValue;
  const effectiveDeliveryFee = (businessPricing?.deliveryFee !== null && businessPricing?.deliveryFee !== undefined)
    ? businessPricing.deliveryFee
    : pricingConfig.defaultDeliveryFee;
  const effectiveMinOrderValue = (businessPricing?.minOrderValue !== null && businessPricing?.minOrderValue !== undefined)
    ? businessPricing.minOrderValue
    : (pricingConfig.minOrderValue !== null ? pricingConfig.minOrderValue : undefined);
  const isConvenienceFeeActive = (businessPricing?.isConvenienceFeeEnabled !== null && businessPricing?.isConvenienceFeeEnabled !== undefined)
    ? businessPricing.isConvenienceFeeEnabled
    : pricingConfig.isConvenienceFeeEnabled;
  const effectiveConvenienceFee = (businessPricing?.convenienceFee !== null && businessPricing?.convenienceFee !== undefined)
    ? businessPricing.convenienceFee
    : pricingConfig.defaultConvenienceFee;

  const deliveryFee = useMemo(() => {
    if (subtotal === 0 || !pricingConfig.deliveryFeeEnabled) return 0;
    if (subtotal >= effectiveFreeDeliveryThreshold) return 0;
    return effectiveDeliveryFee;
  }, [subtotal, pricingConfig.deliveryFeeEnabled, effectiveFreeDeliveryThreshold, effectiveDeliveryFee]);

  const convenienceFee = useMemo(() => {
    if (subtotal === 0 || !isConvenienceFeeActive) return 0;
    return effectiveConvenienceFee;
  }, [subtotal, isConvenienceFeeActive, effectiveConvenienceFee]);

  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;
    return appliedCoupon.discountAmount;
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => {
    if (subtotal === 0) return 0;
    return Math.max(0, subtotal + deliveryFee + convenienceFee - discount);
  }, [subtotal, deliveryFee, convenienceFee, discount]);

  const totalItemsCount = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity, 0);
  }, [items]);

  // Apply Coupon
  const applyCouponCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code' };
    }

    try {
      const res = await validateCoupon({
        code: cleanCode,
        subtotal,
        restaurantId: restaurantId || undefined,
      });

      if (res.valid) {
        setAppliedCoupon({
          code: cleanCode,
          discountAmount: res.discountAmount,
          discountType: res.discountType,
        });
        return { success: true, message: res.message || 'Coupon applied successfully!' };
      } else {
        return { success: false, message: res.message || 'Coupon is not valid' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Invalid coupon code' };
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCouponCode,
        subtotal,
        deliveryFee,
        convenienceFee,
        freeDeliveryThreshold: effectiveFreeDeliveryThreshold,
        minOrderValue: effectiveMinOrderValue,
        isConvenienceFeeEnabled: isConvenienceFeeActive,
        businessPricing,
        refreshPricingConfig,
        discount,
        total,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
