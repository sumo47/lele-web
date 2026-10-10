import React from 'react';
import Link from 'next/link';
import { Phone, Mail, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Refund & Cancellation Policy | LELE',
  description: 'Refund and cancellation guidelines for LELE customers in Nirmali.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
        <p className="text-xs text-gray-400">Effective Date: October 2026</p>

        <section className="space-y-3 pt-4">
          <h2 className="text-lg font-bold text-gray-900">1. Order Cancellation Policy</h2>
          <p>
            Because food items are freshly prepared on order, cancellation rules are designed to protect both customers and partner kitchens:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
            <li>
              <strong>Before Kitchen Accepts:</strong> You can cancel your order directly from the order tracking screen without any cancellation fee.
            </li>
            <li>
              <strong>After Kitchen Begins Preparation:</strong> Once the kitchen begins cooking or the delivery rider is dispatched, orders cannot be cancelled online. If there is an urgent emergency, please call our support hotline immediately.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">2. Eligibility for Refunds</h2>
          <p>Customers are eligible for a replacement or refund under the following conditions:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>The delivered package is damaged, tampered with, or spilled during transit.</li>
            <li>An incorrect item was delivered or items from your order were missing.</li>
            <li>Severe food quality issues verified by our customer care team.</li>
            <li>The order was confirmed but could not be delivered due to operational constraints.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">3. Refund Processing Timelines</h2>
          <p>
            Approved refunds are credited back to the original payment source or customer wallet within <strong>3 to 5 business days</strong> depending on your banking provider.
          </p>
        </section>

        {/* Support Box */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mt-6 space-y-3">
          <h3 className="font-bold text-gray-900 text-base">Need Help with an Order?</h3>
          <p className="text-xs text-gray-600">
            Contact our Nirmali support desk directly for immediate assistance with active orders.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="tel:+918757962224"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E23744] text-white text-xs font-semibold rounded-xl hover:bg-[#d02835] transition"
            >
              <Phone className="w-3.5 h-3.5" />
              Call +91 8757962224
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              Contact Support
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
