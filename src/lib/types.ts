export interface Restaurant {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string | null;
  cuisines: string[];
  rating?: number | null;
  totalReviews?: number;
  deliveryTime?: string;
  priceForOne?: number | null;
  address?: string | null;
  location?: string | null;
  isOpen: boolean;
  isOnline: boolean;
  isPromoted?: boolean;
  phone?: string | null;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  listingPrice?: number | null;
  imageUrl?: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  inStock: boolean;
  isBestseller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  imageUrl?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface HeroBanner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  imageUrl?: string;
  link?: string;
  display_order?: number;
}

export interface Coupon {
  id: string;
  code: string;
  title?: string;
  description?: string;
  discountPercent?: number;
  discountAmount?: number;
  discountType: 'PERCENT' | 'FLAT';
  minOrderValue?: number;
  maxDiscount?: number;
  validTill?: string;
  isEligible?: boolean;
}

export interface CartItem {
  itemId: string;
  id?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVeg: boolean;
  restaurantId?: string;
}

export interface CartData {
  userId?: string;
  restaurantId: string | null;
  restaurant?: {
    id: string;
    name: string;
  } | null;
  items: CartItem[];
  pricing?: {
    subtotal: number;
    deliveryFee: number;
    convenienceFee: number;
    discount: number;
    total: number;
  };
}

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  roles?: string[];
  avatarUrl?: string | null;
  walletBalance?: number;
  isEmailVerified?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface UploadImageResult {
  id: string;
  url?: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  width?: number | null;
  height?: number | null;
  fileSize?: number;
  bytes?: number;
  purpose: string;
  resourceId?: string | null;
  createdAt?: string;
}

export interface CustomerAddress {
  id: string;
  userId?: string;
  title: string;
  addressLine: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  createdAt?: string;
}

export interface OrderItem {
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVeg?: boolean;
}

export interface Order {
  id: string;
  status: 'ordered' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | string;
  restaurant: {
    id: string;
    name: string;
    phone?: string;
    address?: string;
  };
  customer: {
    uid: string;
    name: string;
    phone?: string;
    email?: string;
    deliveryAddress: string;
  };
  delivery?: {
    deliveryBoyName?: string | null;
    deliveryBoyPhone?: string | null;
    deliveryPin?: string;
    pickupPin?: string;
  };
  cookingInstructions?: string;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    convenienceFee: number;
    discount: number;
    couponCode?: string | null;
    total: number;
  };
  payment: {
    method: string;
    status: string;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };
  cancellation?: {
    cancelledBy?: string;
    cancelReason?: string;
  };
}

export interface PublicStoreConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcement: string;
  customerCancellationWindowSeconds: number;
  defaultDeliveryFee: number;
  defaultRestaurantDeliveryFee?: number;
  defaultShopDeliveryFee?: number;
  defaultConvenienceFee: number;
  minOrderValue: number;
  restaurantMinOrderValue?: number;
  shopMinOrderValue?: number;
  freeDeliveryMinOrderValue: number;
  restaurantFreeDeliveryMinOrderValue?: number;
  shopFreeDeliveryMinOrderValue?: number;
  isShopActive: boolean;
  isOnlinePaymentAvailable: boolean;
  isConvenienceFeeEnabled?: boolean;
  homeCarouselEnabled?: boolean;
  partnerOnboardingEnabled?: boolean;
  version?: number;
}

export interface BusinessPricing {
  businessId: string;
  businessType: 'restaurant' | 'shop';
  deliveryFee: number;
  freeDeliveryMinOrderValue: number;
  minOrderValue: number;
  convenienceFee: number;
  isConvenienceFeeEnabled: boolean;
}

