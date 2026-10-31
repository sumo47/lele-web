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
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  roles?: string[];
  avatarUrl?: string | null;
  walletBalance?: number;
  isEmailVerified?: boolean;
  emailVerified?: boolean;
  isBlocked?: boolean;
  isDeactivated?: boolean;
  status?: string;
  blockReason?: string;
  restaurantId?: string | null;
  restaurantName?: string | null;
  isShop?: boolean;
  shopId?: string | null;
  shopName?: string | null;
  shopCategory?: string | null;
  shopApprovalStatus?: 'none' | 'pending' | 'approved' | 'rejected' | string | null;
  shopStatus?: string | null;
  vendorApprovalStatus?: 'none' | 'pending' | 'approved' | 'rejected' | string | null;
  riderApprovalStatus?: 'none' | 'pending' | 'approved' | 'rejected' | string | null;
  riderIsOnline?: boolean;
  riderIsAvailable?: boolean;
  approvalStatus?: string;
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
  id?: string;
  itemId?: string;
  name: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  subtotal?: number;
  imageUrl?: string;
  isVeg?: boolean;
}

export interface Order {
  id: string;
  orderNumber?: string;
  status: 'ordered' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | string;
  deliveryAddress?: string;
  totalAmount?: number;
  createdAt?: string;
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
  orderType?: 'food' | 'shop' | string;
  deliveryMethod?: 'rider' | 'self' | string;
  sellerDeliveryStatus?: 'pending' | 'dispatched' | 'delivered' | string | null;
  sellerDeliveredAt?: string | null;
  deliveredAt?: string | null;
  returnStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'completed' | string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  shopId: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  price: number;
  listingPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold?: number;
  imageUrl?: string | null;
  isActive: boolean;
}

export interface InventoryLog {
  id: string;
  variantId: string;
  variantTitle?: string;
  sku?: string;
  previousQuantity: number;
  newQuantity: number;
  changeAmount: number;
  reason: string;
  orderId?: string | null;
  orderNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ShopProduct {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description?: string;
  categoryTemplateId?: string;
  categoryTemplateSlug?: string;
  categoryTemplateName?: string;
  customCategoryId?: string | null;
  customCategoryName?: string | null;
  brand?: string | null;
  basePrice: number;
  listingPrice?: number | null;
  hasVariants: boolean;
  images: string[];
  imageUrl?: string | null;
  attributes: Record<string, string>;
  totalStock: number;
  isActive: boolean;
  variants: ProductVariant[];
  createdAt?: string;
}

export interface ShopCustomCategory {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
}

export interface CategoryTemplate {
  id: string;
  name: string;
  slug?: string;
  categorySlug: string;
  description?: string;
  suggestedAttributes: any[];
  suggestedVariantDimensions?: any[];
  suggestedVariants?: string[];
  isActive: boolean;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber?: string;
  shopId: string;
  shopName?: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
  requestType: 'return' | 'exchange';
  type?: 'return' | 'exchange';
  reason: string;
  description?: string;
  status: 'pending' | 'requested' | 'approved' | 'rejected' | 'completed' | string;
  items: { variantId: string; productName: string; quantity: number }[];
  images?: string[];
  rejectionReason?: string | null;
  sellerNotes?: string | null;
  createdAt: string;
}

export interface ShopProfile {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  shopCategory: string;
  categoryTemplateName?: string;
  email: string;
  phone: string;
  address: string;
  location?: string;
  imageUrl?: string | null;
  isOpen: boolean;
  isOnline: boolean;
  approvalStatus: string;
  selfDeliveryEnabled: boolean;
  riderDeliveryEnabled: boolean;
  returnPolicyEnabled: boolean;
  returnWindowHours: number;
  rating?: number;
  totalRatings?: number;
}

export interface PublicStoreConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcement: string;
  customerCancellationWindowSeconds: number;
  zoneModeEnabled?: boolean;
  foodDeliveryFeeEnabled?: boolean;
  foodDeliveryFee?: number;
  foodFreeDeliveryThreshold?: number;
  foodConvenienceFeeEnabled?: boolean;
  foodConvenienceFee?: number;
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
  shopDeliveryFeeEnabled?: boolean;
  shopDeliveryFee?: number;
  shopFreeDeliveryThreshold?: number;
  shopConvenienceFeeEnabled?: boolean;
  shopConvenienceFee?: number;
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

// ==========================================
// PARTNER ECOSYSTEM: RESTAURANT / VENDOR
// ==========================================

export interface VendorOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVeg?: boolean;
  selectedVariation?: any;
  customizations?: any[];
}

export interface VendorOrder {
  id: string;
  type: string;
  status: 'ordered' | 'pending' | 'preparing' | 'ready' | 'dispatched' | 'on_the_way' | 'delivered' | 'completed' | 'cancelled' | 'rejected' | string;
  restaurantId: string;
  restaurantName: string;
  customer: {
    name: string;
    phone: string;
    deliveryAddress: string;
    coordinates?: string;
  };
  items: VendorOrderItem[];
  pricing: {
    subtotal: number;
    total: number;
  };
  cookingInstructions?: string;
  pickupPin?: string;
  prepTimeMinutes?: number;
  rider?: {
    name: string | null;
    phone: string | null;
  };
  payment?: {
    method: string;
    status: string;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
    preparingStartedAt?: string;
    readyAt?: string;
    cancelledAt?: string;
    deliveredAt?: string;
  };
  cancellation?: {
    cancelledBy?: string;
    cancelReason?: string;
  };
  orderType?: 'food' | 'shop' | string;
  deliveryMethod?: 'rider' | 'self' | string;
  sellerDeliveryStatus?: 'pending' | 'dispatched' | 'delivered' | string | null;
  sellerDeliveredAt?: string | null;
  deliveredAt?: string | null;
  returnStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'completed' | string;
}

export interface VendorOutlet {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string | null;
  bannerUrls?: string[];
  cuisines?: string[];
  rating?: number;
  totalReviews?: number;
  deliveryTime?: string;
  priceForOne?: number;
  phone?: string;
  email?: string;
  address?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  isOpen: boolean;
  isOnline: boolean;
  isPromoted?: boolean;
  approvalStatus: string;
  status: string;
  minOrderAmount?: number;
  businessType?: string;
  commissionRate?: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  city?: string;
  pincode?: string;
  fssaiNumber?: string;
  fssaiCertUrl?: string;
  gstNumber?: string;
  panNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorCatalogItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  listingPrice?: number | null;
  imageUrl?: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  inStock: boolean;
  isBestseller?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  restaurantId?: string;
}

// ==========================================
// PARTNER ECOSYSTEM: RIDER / DELIVERY
// ==========================================

export interface RiderOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVeg?: boolean;
}

export interface RiderOrder {
  id: string;
  orderType: string;
  status: 'ordered' | 'pending' | 'preparing' | 'ready' | 'dispatched' | 'on_the_way' | 'delivered' | 'completed' | 'cancelled' | string;
  restaurant: {
    id: string;
    name: string;
    phone?: string;
    address?: string;
    location?: string;
    coordinates?: string;
  };
  customer: {
    name: string;
    phone: string;
    deliveryAddress: string;
    coordinates?: string;
  };
  items: RiderOrderItem[];
  pricing: {
    total: number;
    subtotal: number;
  };
  riderPayout: number;
  payment: {
    method: string;
    status: string;
  };
  cookingInstructions?: string;
  timestamps: {
    createdAt: string;
    updatedAt: string;
    acceptedAt?: string;
    pickupTime?: string;
    deliveredAt?: string;
  };
}

export interface RiderProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  pincode?: string;
  vehicleType: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  licenseUrl?: string;
  vehicleRcUrl?: string;
  idProofType?: string;
  idProofNumber?: string;
  idProofUrl?: string;
  approvalStatus: string;
  isOnline: boolean;
  isAvailable: boolean;
  totalDeliveries: number;
  rating: number;
  walletBalance: number;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RiderDutyStatus {
  isOnline: boolean;
  isAvailable?: boolean;
}

