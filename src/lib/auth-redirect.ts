import type { UserProfile } from './types';

export interface PartnerStatusInfo {
  isAdmin: boolean;
  isVendorApproved: boolean;
  isRiderApproved: boolean;
  isShopApproved: boolean;
  isVendorPending: boolean;
  isRiderPending: boolean;
  isShopPending: boolean;
  isVendorRejected: boolean;
  isRiderRejected: boolean;
  isShopRejected: boolean;
  isBlockedOrDeactivated: boolean;
  hasPartnerRole: boolean;
  shopId?: string | null;
}

/**
 * Authoritatively resolves user partner status flags from a UserProfile.
 */
export function resolvePartnerStatus(user: UserProfile | null): PartnerStatusInfo {
  if (!user) {
    return {
      isAdmin: false,
      isVendorApproved: false,
      isRiderApproved: false,
      isShopApproved: false,
      isVendorPending: false,
      isRiderPending: false,
      isShopPending: false,
      isVendorRejected: false,
      isRiderRejected: false,
      isShopRejected: false,
      isBlockedOrDeactivated: false,
      hasPartnerRole: false,
    };
  }

  const roles = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [];
  const isAdmin = roles.includes('admin') || roles.includes('superadmin');
  const isBlockedOrDeactivated = Boolean(
    user.isBlocked ||
      user.isDeactivated ||
      user.status === 'blocked' ||
      user.status === 'deactivated' ||
      user.status === 'suspended'
  );

  const isShopStore = Boolean(user.isShop || user.shopId || user.shopCategory);

  const isVendorApproved =
    !isBlockedOrDeactivated &&
    !isShopStore &&
    (isAdmin ||
      ((roles.includes('vendor') || user.role === 'vendor') &&
        user.vendorApprovalStatus === 'approved') ||
      Boolean(user.restaurantId && user.vendorApprovalStatus === 'approved'));

  const isVendorPending = !isBlockedOrDeactivated && !isShopStore && user.vendorApprovalStatus === 'pending';
  const isVendorRejected = !isBlockedOrDeactivated && !isShopStore && user.vendorApprovalStatus === 'rejected';

  const isRiderApproved =
    !isBlockedOrDeactivated &&
    (isAdmin ||
      ((roles.includes('rider') || user.role === 'rider') &&
        user.riderApprovalStatus === 'approved'));

  const isRiderPending = !isBlockedOrDeactivated && user.riderApprovalStatus === 'pending';
  const isRiderRejected = !isBlockedOrDeactivated && user.riderApprovalStatus === 'rejected';

  const isShopApproved =
    !isBlockedOrDeactivated &&
    (isAdmin ||
      ((roles.includes('shop') || user.role === 'shop') &&
        (user.shopApprovalStatus === 'approved' || user.approvalStatus === 'approved')) ||
      Boolean((user.shopId || user.isShop) && (user.shopApprovalStatus === 'approved' || user.approvalStatus === 'approved')));

  const isShopPending = !isBlockedOrDeactivated && (user.shopApprovalStatus === 'pending' || (isShopStore && user.vendorApprovalStatus === 'pending'));
  const isShopRejected = !isBlockedOrDeactivated && (user.shopApprovalStatus === 'rejected' || (isShopStore && user.vendorApprovalStatus === 'rejected'));

  const hasPartnerRole = isVendorApproved || isRiderApproved || isShopApproved;

  return {
    isAdmin,
    isVendorApproved,
    isRiderApproved,
    isShopApproved,
    isVendorPending,
    isRiderPending,
    isShopPending,
    isVendorRejected,
    isRiderRejected,
    isShopRejected,
    isBlockedOrDeactivated,
    hasPartnerRole,
    shopId: user.shopId || (isShopStore ? user.restaurantId : null),
  };
}

/**
 * Sanitizes redirect URL to prevent open redirect vulnerabilities.
 * Allows only relative paths starting with a single forward slash.
 */
export function sanitizeRedirectPath(rawPath?: string | null): string | null {
  if (!rawPath || typeof rawPath !== 'string') return null;
  const trimmed = rawPath.trim();
  // Disallow absolute URLs (http://, https://), protocol-relative (//), or backslashes (/\)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return trimmed;
  }
  return null;
}

/**
 * Determines authoritative post-login redirect path based on user roles and requested path.
 *
 * Requirements:
 * 1. Approved Restaurant-only partner signs in: -> '/partner/restaurant'
 * 2. Approved Rider-only partner signs in: -> '/partner/rider'
 * 3. Customer-only user signs in: -> Requested path or '/'
 * 4. User with both approved Restaurant and Rider roles: -> '/partner' (role selection), unless valid authorized partner destination requested
 * 5. User with an approved partner role and Customer role:
 *    -> Default to partner dashboard, UNLESS user explicitly requested a valid customer destination.
 * 6. Pending or rejected partner: -> No operational dashboard access. Show status screen if requested, else customer experience.
 * 7. Blocked/deactivated: -> Never redirect to partner dashboards.
 */
export function determinePostLoginRedirect(
  user: UserProfile | null,
  rawRedirect?: string | null
): string {
  const safePath = sanitizeRedirectPath(rawRedirect);
  const status = resolvePartnerStatus(user);

  // If blocked or deactivated, do not send to partner dashboards
  if (status.isBlockedOrDeactivated) {
    return '/account';
  }

  const hasExplicitRedirect = Boolean(safePath && safePath !== '/');

  // Case A: User explicitly requested a destination
  if (hasExplicitRedirect && safePath) {
    // 1. If requested destination is a restaurant partner route
    if (safePath.startsWith('/partner/restaurant')) {
      if (status.isVendorApproved) {
        return safePath;
      }
      if (status.isVendorPending || status.isVendorRejected) {
        return safePath; // PartnerRouteGuard will display pending/rejected status screen
      }
      if (status.isRiderApproved) {
        return '/partner/rider';
      }
      return '/';
    }

    // 2. If requested destination is a rider partner route
    if (safePath.startsWith('/partner/rider')) {
      if (status.isRiderApproved) {
        return safePath;
      }
      if (status.isRiderPending || status.isRiderRejected) {
        return safePath; // PartnerRouteGuard will display pending/rejected status screen
      }
      if (status.isShopApproved) {
        return '/partner/shop';
      }
      if (status.isVendorApproved) {
        return '/partner/restaurant';
      }
      return '/';
    }

    // 3. If requested destination is a shop partner route
    if (safePath.startsWith('/partner/shop')) {
      if (status.isShopApproved) {
        return safePath;
      }
      if (status.isShopPending || status.isShopRejected) {
        return safePath;
      }
      if (status.isVendorApproved) {
        return '/partner/restaurant';
      }
      if (status.isRiderApproved) {
        return '/partner/rider';
      }
      return '/';
    }

    // 4. If requested destination is the central partner hub '/partner'
    if (safePath === '/partner') {
      return '/partner';
    }

    // 5. If requested destination is an authorized customer route (e.g. /checkout, /cart, /orders, /account, /catalog, etc.)
    return safePath;
  }

  // Case B: No explicit destination requested (default sign-in)
  // Multiple approved partner roles
  const approvedCount = [status.isVendorApproved, status.isRiderApproved, status.isShopApproved].filter(Boolean).length;
  if (approvedCount > 1) {
    return '/partner';
  }

  // Approved Shop
  if (status.isShopApproved) {
    return '/partner/shop';
  }

  // Approved Restaurant
  if (status.isVendorApproved) {
    return '/partner/restaurant';
  }

  // Approved Rider
  if (status.isRiderApproved) {
    return '/partner/rider';
  }

  // Customer-only or pending/rejected with no approved partner role
  return '/';
}
