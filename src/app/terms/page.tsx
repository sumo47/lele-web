import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | LELE',
  description: 'Terms of Service and Customer Agreement for LELE Nirmali.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-xs text-gray-400">Effective Date: October 2026</p>

        <section className="space-y-3 pt-4">
          <h2 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or placing orders through the LELE website or mobile application, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue use immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">2. Ordering & Restaurant Menu Authority</h2>
          <p>
            LELE operates as a marketplace facilitating the ordering and hyperlocal delivery of food and items prepared by partner restaurants in Nirmali, Bihar.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>All prices are quoted in Indian Rupees (₹ INR) inclusive of applicable taxes.</li>
            <li>Item availability and prices are determined by partner restaurants and authoritative backend validation.</li>
            <li>In the event of an item being out of stock after order placement, customer support will promptly assist with a substitute or cancellation.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">3. Delivery & Handover</h2>
          <p>
            Delivery time estimates (typically 30–45 minutes) are calculated based on kitchen preparation time, traffic, and distance from the restaurant to the delivery location in Nirmali. While our delivery partners make every effort to deliver punctually, unforeseen conditions such as heavy rain or train crossing delays may affect actual timings.
          </p>
          <p>
            Customers must provide accurate contact phone numbers and be reachable at the designated delivery point. For security, delivery handover requires verifying the 4-digit Delivery PIN provided in your order tracking screen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">4. User Account & Conduct</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account password and OTP codes. You agree not to create fraudulent accounts, exploit promotional coupons unlawfully, or place false orders.
          </p>
        </section>
      </div>
    </div>
  );
}
