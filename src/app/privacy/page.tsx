import React from 'react';

export const metadata = {
  title: 'Privacy Policy | LELE',
  description: 'Privacy Policy for LELE hyperlocal delivery platform in Nirmali, Bihar.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-xs text-gray-400">Last updated: October 2026</p>

        <section className="space-y-3 pt-4">
          <h2 className="text-lg font-bold text-gray-900">1. Information We Collect</h2>
          <p>
            When you register, place orders, or browse LELE, we collect information necessary to fulfill your orders safely and efficiently:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li><strong>Account Details:</strong> Full name, verified email address, contact phone number, and password hash.</li>
            <li><strong>Delivery Addresses:</strong> Street address, landmarks, PIN code, and GPS coordinates provided for precise delivery.</li>
            <li><strong>Order History:</strong> Dish selections, quantities, coupons used, order totals, and fulfillment timestamps.</li>
            <li><strong>Device & Usage Data:</strong> IP address, browser type, and interaction telemetry for fraud detection and performance.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">2. How We Use Your Information</h2>
          <p>We process your data strictly to provide LELE services:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Facilitating food preparation with partner restaurants.</li>
            <li>Dispatching assigned delivery riders to your delivery address.</li>
            <li>Sending transactional notifications including order confirmation, delivery OTPs, and password reset codes.</li>
            <li>Preventing abuse, fraudulent orders, and unauthorized access.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">3. Data Sharing & Security</h2>
          <p>
            We do not sell, rent, or trade your personal information. Relevant details (such as your address, phone number, and order items) are shared only with the assigned restaurant and delivery personnel solely for completing the delivery of your order.
          </p>
          <p>
            Your authentication credentials are encrypted using industry-standard hashing, and all communications are transmitted over secure TLS protocols.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">4. Contact & Inquiries</h2>
          <p>
            If you have questions regarding your personal information or wish to request data deletion, contact our Data Protection Officer at:
          </p>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
            <p className="font-semibold text-gray-900">LELE Operations Team</p>
            <p>Main Market Road, Nirmali, Supaul, Bihar - 847452</p>
            <p className="mt-1">Email: <a href="mailto:support@lele.store" className="text-[#E23744] underline">support@lele.store</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
