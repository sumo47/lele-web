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
