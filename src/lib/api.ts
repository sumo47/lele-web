import type {
  Restaurant,
  MenuItem,
  Category,
  HeroBanner,
  Coupon,
  CartData,
  UserProfile,
  CustomerAddress,
  Order,
  PublicStoreConfig,
  BusinessPricing,
  VendorOrder,
  VendorOutlet,
  VendorCatalogItem,
  VendorCategory,
  RiderOrder,
  RiderProfile,
  RiderDutyStatus,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code = 'ERROR', statusCode = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Token helper with localStorage
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lele_access_token');
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('lele_access_token', token);
  } else {
    localStorage.removeItem('lele_access_token');
  }
}

// Core fetch wrapper
export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg =
        data?.message ||
        data?.error?.message ||
        `Request failed with status ${res.status}`;
      const errCode = data?.code || data?.error?.code || 'UNKNOWN_ERROR';
      throw new ApiError(errMsg, errCode, res.status);
    }

    return (data?.data !== undefined ? data.data : data) as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error or server unreachable',
      'NETWORK_ERROR',
      503
    );
  }
}

// ==========================================
// 1. STOREFRONT PUBLIC APIS
// ==========================================

export async function getPublicConfig(): Promise<PublicStoreConfig> {
  return fetchApi<PublicStoreConfig>('/config/public');
}

export async function getBusinessPricing(businessId: string): Promise<BusinessPricing> {
  const res = await fetchApi<any>(`/config/business/${encodeURIComponent(businessId)}`);
  return res?.data || res;
}

export async function getHeroBanners(): Promise<HeroBanner[]> {
  try {
    return await fetchApi<HeroBanner[]>('/banners');
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await fetchApi<Category[]>('/categories');
  } catch {
    return [];
  }
}

export async function getRestaurants(params?: {
  page?: number;
  limit?: number;
}): Promise<Restaurant[]> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const res = await fetchApi<any>(`/restaurants?${query.toString()}`);
  return Array.isArray(res) ? res : res?.data || [];
}

export async function getRestaurantById(id: string): Promise<Restaurant> {
  return fetchApi<Restaurant>(`/restaurants/${id}`);
}

export async function getRestaurantMenu(
  restaurantId: string,
  params?: { category?: string; veg?: boolean }
): Promise<MenuItem[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.veg !== undefined) query.set('veg', String(params.veg));
  const res = await fetchApi<any>(`/restaurants/${restaurantId}/menu?${query.toString()}`);
  return Array.isArray(res) ? res : res?.data || [];
}

export async function searchCatalog(params: {
  q: string;
  type?: 'all' | 'dish' | 'restaurant';
  veg?: boolean;
}): Promise<{
  restaurants: Restaurant[];
  dishes: MenuItem[];
}> {
  const query = new URLSearchParams();
  query.set('q', params.q || '');
  if (params.type) query.set('type', params.type);
  if (params.veg !== undefined) query.set('veg', String(params.veg));

  const res = await fetchApi<any>(`/search?${query.toString()}`);
  const items = Array.isArray(res) ? res : res?.data || [];

  const restaurants: Restaurant[] = [];
  const dishes: MenuItem[] = [];

  for (const item of items) {
    if (item.type === 'restaurant') {
      restaurants.push(item);
    } else {
      dishes.push(item);
    }
  }

  return { restaurants, dishes };
}

export async function getAvailableCoupons(subtotal?: number): Promise<Coupon[]> {
  try {
    const q = subtotal ? `?subtotal=${subtotal}` : '';
    const res = await fetchApi<any>(`/coupons/available${q}`);
    return Array.isArray(res) ? res : res?.data || [];
  } catch {
    return [];
  }
}

export async function validateCoupon(input: {
  code: string;
  subtotal: number;
  restaurantId?: string;
}): Promise<{
  valid: boolean;
  code: string;
  discountAmount: number;
  discountType: string;
  message: string;
}> {
  return fetchApi('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// ==========================================
// 2. AUTHENTICATION & PROFILE
// ==========================================

export async function apiSignup(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}) {
  const res = await fetchApi<any>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res?.accessToken) {
    setStoredToken(res.accessToken);
  }
  return res;
}

export async function apiLogin(credentials: {
  email: string;
  password: string;
}) {
  const res = await fetchApi<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (res?.accessToken) {
    setStoredToken(res.accessToken);
  }
  return res;
}

export async function apiGoogleLogin(idToken: string) {
  const res = await fetchApi<any>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
  if (res?.accessToken) {
    setStoredToken(res.accessToken);
  }
  return res;
}

export async function apiGetMe(): Promise<UserProfile> {
  return fetchApi<UserProfile>('/auth/me');
}

export async function apiLogout(): Promise<void> {
  try {
    await fetchApi('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore network error on logout
  } finally {
    setStoredToken(null);
  }
}

export async function apiSendEmailVerification() {
  return fetchApi('/auth/email/verify/send', {
    method: 'POST',
  });
}

export async function apiVerifyEmail(data: { otp: string; challengeId?: string }) {
  return fetchApi('/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiForgotPassword(email: string) {
  return fetchApi('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(data: {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  challengeId?: string;
}) {
  return fetchApi('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateProfile(data: {
  name?: string;
  phone?: string;
}) {
  return fetchApi('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ==========================================
// 3. ADDRESSES
// ==========================================

export async function apiGetAddresses(): Promise<CustomerAddress[]> {
  const res = await fetchApi<any>('/users/addresses');
  return Array.isArray(res) ? res : res?.data || [];
}

export async function apiCreateAddress(data: {
  title?: string;
  addressLine: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isDefault?: boolean;
}): Promise<CustomerAddress> {
  return fetchApi('/users/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateAddress(
  addressId: string,
  data: Partial<CustomerAddress>
): Promise<CustomerAddress> {
  return fetchApi(`/users/addresses/${addressId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteAddress(addressId: string): Promise<void> {
  return fetchApi(`/users/addresses/${addressId}`, {
    method: 'DELETE',
  });
}

export async function apiSetDefaultAddress(addressId: string): Promise<void> {
  return fetchApi(`/users/addresses/${addressId}/default`, {
    method: 'POST',
  });
}

// ==========================================
// 4. CART & CHECKOUT
// ==========================================

export async function apiGetCart(): Promise<CartData> {
  return fetchApi<CartData>('/cart');
}

export async function apiAddToCart(input: {
  itemId: string;
  quantity?: number;
}): Promise<CartData> {
  return fetchApi<CartData>('/cart/items', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function apiUpdateCartItem(
  itemId: string,
  quantity: number
): Promise<CartData> {
  return fetchApi<CartData>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export async function apiRemoveCartItem(itemId: string): Promise<CartData> {
  return fetchApi<CartData>(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}

export async function apiClearCart(): Promise<CartData> {
  return fetchApi<CartData>('/cart', {
    method: 'DELETE',
  });
}

export async function apiCreateOrder(input: {
  deliveryAddress: string;
  customerCoordinates?: string;
  customerPhone?: string;
  customerName?: string;
  cookingInstructions?: string;
  couponCode?: string;
}): Promise<Order> {
  return fetchApi<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function apiGetOrders(): Promise<Order[]> {
  const res = await fetchApi<any>('/orders');
  return Array.isArray(res) ? res : res?.data || [];
}

export async function apiGetOrderById(orderId: string): Promise<Order> {
  return fetchApi<Order>(`/orders/${orderId}`);
}

export async function apiCancelOrder(
  orderId: string,
  reason?: string
): Promise<Order> {
  return fetchApi<Order>(`/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || 'Cancelled by customer' }),
  });
}

// ==========================================
// 5. MEDIA & UPLOAD
// ==========================================
export { uploadImage, apiUploadProfilePhoto } from './uploadApi';
export type { UploadImageOptions } from './uploadApi';
export {
  validateImageFile,
  formatBytes,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
} from './uploadValidation';

// ==========================================
// 6. PARTNER ONBOARDING APIS
// ==========================================
export async function applyRiderPartner(data: Record<string, any>): Promise<any> {
  return fetchApi('/riders/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function applyRestaurantPartner(data: Record<string, any>): Promise<any> {
  return fetchApi('/restaurants/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==========================================
// 7. RESTAURANT / VENDOR DASHBOARD APIS
// ==========================================

export async function apiGetVendorOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
  restaurantId?: string;
}): Promise<{ data: VendorOrder[]; pagination?: any }> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.restaurantId) query.set('restaurantId', params.restaurantId);

  const res = await fetchApi<any>(`/vendor/orders?${query.toString()}`);
  if (Array.isArray(res)) {
    return { data: res, pagination: { page: 1, limit: res.length, total: res.length, totalPages: 1 } };
  }
  return {
    data: res?.data || [],
    pagination: res?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

export async function apiGetVendorOrderById(orderId: string): Promise<VendorOrder> {
  return fetchApi<VendorOrder>(`/vendor/orders/${encodeURIComponent(orderId)}`);
}

export async function apiAcceptVendorOrder(
  orderId: string,
  prepTimeMinutes = 20
): Promise<VendorOrder> {
  return fetchApi<VendorOrder>(`/vendor/orders/${encodeURIComponent(orderId)}/accept`, {
    method: 'POST',
    body: JSON.stringify({ prepTimeMinutes }),
  });
}

export async function apiUpdateVendorOrderStatus(
  orderId: string,
  status: 'preparing' | 'ready' | 'cancelled',
  options?: { prepTimeMinutes?: number; reason?: string }
): Promise<VendorOrder> {
  return fetchApi<VendorOrder>(`/vendor/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      prepTimeMinutes: options?.prepTimeMinutes ?? 20,
      reason: options?.reason ?? 'Item Out of Stock',
    }),
  });
}

export async function apiRejectVendorOrder(
  orderId: string,
  reason: string
): Promise<{ success: boolean; orderId: string }> {
  return fetchApi<any>(`/vendor/orders/${encodeURIComponent(orderId)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function apiGetVendorOutlet(restaurantId?: string): Promise<VendorOutlet> {
  const query = new URLSearchParams();
  if (restaurantId) query.set('restaurantId', restaurantId);
  const qStr = query.toString();
  return fetchApi<VendorOutlet>(`/vendor/outlet${qStr ? `?${qStr}` : ''}`);
}

export async function apiUpdateVendorOutletStatus(
  isOnline: boolean,
  restaurantId: string
): Promise<{ restaurantId: string; isOnline: boolean; isOpen: boolean }> {
  return fetchApi<any>('/vendor/outlet/status', {
    method: 'PATCH',
    body: JSON.stringify({ isOnline, restaurantId }),
  });
}

export async function apiGetVendorCatalogItems(params?: {
  categoryId?: string;
  search?: string;
  restaurantId?: string;
}): Promise<VendorCatalogItem[]> {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  if (params?.search) query.set('search', params.search);
  if (params?.restaurantId) query.set('restaurantId', params.restaurantId);

  const res = await fetchApi<any>(`/vendor/catalog/items?${query.toString()}`);
  return Array.isArray(res) ? res : res?.data || [];
}

export async function apiGetVendorCategories(restaurantId?: string): Promise<VendorCategory[]> {
  const query = new URLSearchParams();
  if (restaurantId) query.set('restaurantId', restaurantId);
  const res = await fetchApi<any>(`/vendor/catalog/categories?${query.toString()}`);
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.systemCategories) && res.systemCategories.length > 0) {
    return res.systemCategories.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }
  if (Array.isArray(res?.categories) && res.categories.length > 0) {
    return res.categories.map((catName: string) => ({
      id: String(catName).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: String(catName),
      slug: String(catName).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export async function apiCreateVendorCatalogItem(
  item: Partial<VendorCatalogItem>
): Promise<VendorCatalogItem> {
  return fetchApi<VendorCatalogItem>('/vendor/catalog/items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function apiUpdateVendorCatalogItem(
  itemId: string,
  item: Partial<VendorCatalogItem>
): Promise<VendorCatalogItem> {
  return fetchApi<VendorCatalogItem>(`/vendor/catalog/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
}

export async function apiToggleVendorItemAvailability(
  itemId: string,
  inStock: boolean
): Promise<VendorCatalogItem> {
  return fetchApi<VendorCatalogItem>(
    `/vendor/catalog/items/${encodeURIComponent(itemId)}/availability`,
    {
      method: 'PATCH',
      body: JSON.stringify({ inStock }),
    }
  );
}

export async function apiDeleteVendorCatalogItem(
  itemId: string
): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(
    `/vendor/catalog/items/${encodeURIComponent(itemId)}`,
    {
      method: 'DELETE',
    }
  );
}

// ==========================================
// 8. RIDER / DELIVERY DASHBOARD APIS
// ==========================================

export async function apiGetRiderOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: RiderOrder[]; pagination?: any }> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const res = await fetchApi<any>(`/rider/orders?${query.toString()}`);
  if (Array.isArray(res)) {
    return { data: res, pagination: { page: 1, limit: res.length, total: res.length, totalPages: 1 } };
  }
  return {
    data: res?.data || [],
    pagination: res?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

export async function apiGetAvailableRiderOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: RiderOrder[]; pagination?: any }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const res = await fetchApi<any>(`/rider/orders/available?${query.toString()}`);
  if (Array.isArray(res)) {
    return { data: res, pagination: { page: 1, limit: res.length, total: res.length, totalPages: 1 } };
  }
  return {
    data: res?.data || [],
    pagination: res?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

export async function apiGetRiderOrderById(orderId: string): Promise<RiderOrder> {
  return fetchApi<RiderOrder>(`/rider/orders/${encodeURIComponent(orderId)}`);
}

export async function apiAcceptRiderOrder(orderId: string): Promise<RiderOrder> {
  return fetchApi<RiderOrder>(`/rider/orders/${encodeURIComponent(orderId)}/accept`, {
    method: 'POST',
  });
}

export async function apiRejectRiderOrder(
  orderId: string,
  reason = 'Declined by delivery partner'
): Promise<{ success: boolean }> {
  return fetchApi<any>(`/rider/orders/${encodeURIComponent(orderId)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function apiVerifyRiderPickup(
  orderId: string,
  pickupPin: string
): Promise<RiderOrder> {
  return fetchApi<RiderOrder>(`/rider/orders/${encodeURIComponent(orderId)}/pickup`, {
    method: 'POST',
    body: JSON.stringify({ pickupPin }),
  });
}

export async function apiCompleteRiderDelivery(
  orderId: string,
  deliveryPin: string
): Promise<{ success: boolean; orderId: string; payout: number }> {
  return fetchApi<any>(`/rider/orders/${encodeURIComponent(orderId)}/deliver`, {
    method: 'POST',
    body: JSON.stringify({ deliveryPin }),
  });
}

export async function apiUpdateRiderStatus(isOnline: boolean): Promise<RiderDutyStatus> {
  return fetchApi<RiderDutyStatus>('/rider/status', {
    method: 'PATCH',
    body: JSON.stringify({ isOnline }),
  });
}

export async function apiGetRiderProfile(): Promise<RiderProfile> {
  return fetchApi<RiderProfile>('/rider/profile');
}



