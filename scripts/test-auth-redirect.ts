import assert from 'node:assert/strict';
import {
  resolvePartnerStatus,
  sanitizeRedirectPath,
  determinePostLoginRedirect,
} from '../src/lib/auth-redirect';
import type { UserProfile } from '../src/lib/types';

function makeUser(overrides: Partial<UserProfile>): UserProfile {
  return {
    id: 'usr_test_123',
    uid: 'usr_test_123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer',
    ...overrides,
  };
}

console.log('--- RUNNING LELE WEB AUTH REDIRECT & PARTNER ROLE TEST SUITE ---');

// Test 1: Approved Restaurant-only user signs in with no redirect -> '/partner/restaurant'
{
  const user = makeUser({
    role: 'vendor',
    roles: ['vendor'],
    restaurantId: 'rest_123',
    vendorApprovalStatus: 'approved',
  });
  const redirect = determinePostLoginRedirect(user, null);
  assert.equal(redirect, '/partner/restaurant', 'Test 1 Failed: Restaurant-only user should land on /partner/restaurant');
  console.log('✓ Test 1 Passed: Approved Restaurant-only user lands on /partner/restaurant');
}

// Test 2: Approved Rider-only user signs in with no redirect -> '/partner/rider'
{
  const user = makeUser({
    role: 'rider',
    roles: ['rider'],
    riderApprovalStatus: 'approved',
  });
  const redirect = determinePostLoginRedirect(user, null);
  assert.equal(redirect, '/partner/rider', 'Test 2 Failed: Rider-only user should land on /partner/rider');
  console.log('✓ Test 2 Passed: Approved Rider-only user lands on /partner/rider');
}

// Test 3: Customer-only user signs in with no redirect -> '/'
{
  const user = makeUser({
    role: 'customer',
    roles: ['customer'],
  });
  const redirect = determinePostLoginRedirect(user, null);
  assert.equal(redirect, '/', 'Test 3 Failed: Customer-only user should land on /');
  console.log('✓ Test 3 Passed: Customer-only user lands on /');
}

// Test 4: Customer-only user signs in with explicit redirect -> preserves requested destination
{
  const user = makeUser({
    role: 'customer',
    roles: ['customer'],
  });
  const redirect = determinePostLoginRedirect(user, '/checkout');
  assert.equal(redirect, '/checkout', 'Test 4 Failed: Customer explicit redirect /checkout preserved');
  console.log('✓ Test 4 Passed: Customer-only user preserves requested destination (/checkout)');
}

// Test 5: User with both approved Restaurant and Rider roles signs in with no redirect -> '/partner'
{
  const user = makeUser({
    role: 'vendor',
    roles: ['customer', 'vendor', 'rider'],
    restaurantId: 'rest_123',
    vendorApprovalStatus: 'approved',
    riderApprovalStatus: 'approved',
  });
  const redirect = determinePostLoginRedirect(user, null);
  assert.equal(redirect, '/partner', 'Test 5 Failed: Dual approved partner should land on /partner');
  console.log('✓ Test 5 Passed: Dual approved partner lands on /partner to choose console');
}

// Test 6: User with both approved Restaurant and Rider roles with explicit restaurant destination
{
  const user = makeUser({
    role: 'vendor',
    roles: ['customer', 'vendor', 'rider'],
    restaurantId: 'rest_123',
    vendorApprovalStatus: 'approved',
    riderApprovalStatus: 'approved',
  });
  const redirect = determinePostLoginRedirect(user, '/partner/restaurant/orders');
  assert.equal(redirect, '/partner/restaurant/orders', 'Test 6 Failed: Dual partner preserves authorized restaurant destination');
  console.log('✓ Test 6 Passed: Dual partner lands on explicitly requested authorized dashboard');
}

// Test 7: Multi-role user (Customer + approved Restaurant) with customer destination -> preserves customer destination
{
  const user = makeUser({
    role: 'customer',
    roles: ['customer', 'vendor'],
    restaurantId: 'rest_123',
    vendorApprovalStatus: 'approved',
  });
  const redirect = determinePostLoginRedirect(user, '/orders');
  assert.equal(redirect, '/orders', 'Test 7 Failed: Multi-role user requesting /orders should land on /orders');
  console.log('✓ Test 7 Passed: Multi-role user with explicit customer destination lands on customer page (/orders)');
}

// Test 8: Multi-role user (Customer + approved Restaurant) with NO redirect -> defaults to partner dashboard
{
  const user = makeUser({
    role: 'customer',
    roles: ['customer', 'vendor'],
    restaurantId: 'rest_123',
    vendorApprovalStatus: 'approved',
  });
  const redirect = determinePostLoginRedirect(user, null);
  assert.equal(redirect, '/partner/restaurant', 'Test 8 Failed: Multi-role user without redirect should default to partner dashboard');
  console.log('✓ Test 8 Passed: Multi-role user defaults to partner dashboard (/partner/restaurant) when no destination given');
}

// Test 9: Pending restaurant partner signs in with no redirect -> stays on customer storefront ('/')
{
  const user = makeUser({
    role: 'customer',
    roles: ['customer'],
    vendorApprovalStatus: 'pending',
  });
  const redirect = determinePostLoginRedirect(user, null);
  assert.equal(redirect, '/', 'Test 9 Failed: Pending partner should not be forced into operational dashboard');
  console.log('✓ Test 9 Passed: Pending restaurant partner lands on storefront (not granted operational dashboard)');
}

// Test 10: Pending restaurant partner attempting to access restaurant area -> allowed so PartnerRouteGuard shows status screen
{
  const user = makeUser({
    role: 'customer',
    roles: ['customer'],
    vendorApprovalStatus: 'pending',
  });
  const redirect = determinePostLoginRedirect(user, '/partner/restaurant');
  assert.equal(redirect, '/partner/restaurant', 'Test 10 Failed: Pending partner should reach partner route where status screen is rendered');
  console.log('✓ Test 10 Passed: Pending restaurant partner allowed to reach /partner/restaurant for review status screen');
}

// Test 11: Pending rider partner signs in with no redirect -> stays on customer storefront ('/')
{
  const user = makeUser({
    role: 'customer',
    roles: ['customer'],
    riderApprovalStatus: 'pending',
  });
  const redirect = determinePostLoginRedirect(user, null);
  assert.equal(redirect, '/', 'Test 11 Failed: Pending rider partner should not be forced into operational dashboard');
  console.log('✓ Test 11 Passed: Pending rider partner lands on storefront (not granted operational dashboard)');
}

// Test 12: Blocked / suspended account -> never redirected to operational dashboards
{
  const user = makeUser({
    role: 'vendor',
    roles: ['vendor'],
    restaurantId: 'rest_123',
    vendorApprovalStatus: 'approved',
    isBlocked: true,
  });
  const status = resolvePartnerStatus(user);
  assert.equal(status.isBlockedOrDeactivated, true, 'User should be marked blocked');
  assert.equal(status.isVendorApproved, false, 'Blocked user cannot have isVendorApproved=true');
  const redirect = determinePostLoginRedirect(user, '/partner/restaurant');
  assert.equal(redirect, '/account', 'Test 12 Failed: Blocked user must be redirected away from partner dashboard to /account');
  console.log('✓ Test 12 Passed: Blocked user cannot access operational dashboard (redirected to /account)');
}

// Test 13: Open redirect attack protection (protocol-relative or absolute URL)
{
  const user = makeUser({ role: 'customer' });
  assert.equal(sanitizeRedirectPath('https://malicious.site'), null);
  assert.equal(sanitizeRedirectPath('//evil.com'), null);
  assert.equal(sanitizeRedirectPath('/\\evil.com'), null);
  assert.equal(sanitizeRedirectPath('javascript:alert(1)'), null);
  assert.equal(determinePostLoginRedirect(user, '//evil.com'), '/');
  assert.equal(determinePostLoginRedirect(user, 'https://evil.com'), '/');
  console.log('✓ Test 13 Passed: Open redirect attacks safely sanitized and rejected');
}

// Test 14: Pure customer requesting /partner/restaurant -> safely diverted to '/'
{
  const user = makeUser({ role: 'customer', roles: ['customer'] });
  const redirect = determinePostLoginRedirect(user, '/partner/restaurant/orders');
  assert.equal(redirect, '/', 'Test 14 Failed: Pure customer trying to login to restaurant orders should be sent to /');
  console.log('✓ Test 14 Passed: Pure customer attempting unauthorized partner route safely diverted to /');
}

console.log('\n--- ALL 14 AUTH REDIRECT & PARTNER ROLE TESTS PASSED PERFECTLY! ---');
