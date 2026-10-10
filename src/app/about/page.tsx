import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Clock, Heart, Award, MapPin, Phone, Mail } from 'lucide-react';

export const metadata = {
  title: 'About Us | LELE - Nirmali Food & Grocery Delivery',
  description: 'Learn about LELE, Nirmali’s premier hyperlocal food delivery service bringing the best local kitchens straight to your doorstep.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 text-[#E23744] text-xs font-bold border border-red-200">
            Proudly Born in Nirmali, Bihar
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Nirmali&apos;s Fastest Food & Grocery Delivery Service
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            LELE was founded with a singular mission: to connect every household in Nirmali with delicious, freshly prepared meals and daily essentials from trusted local kitchens within 30 minutes.
          </p>
        </div>

        {/* Brand Story */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            For years, small-town residents and travelers passing through the bustling Nirmali railway junction had limited access to organized, hygienic on-demand food delivery. Local restaurants had fantastic culinary talent but lacked the technology and delivery infrastructure to reach every doorstep.
          </p>
          <p className="text-gray-600 leading-relaxed text-sm">
            LELE bridges this gap by offering a modern mobile and web platform tailored specifically for Nirmali. From classic Biryani to crispy Dosa, North Indian curries, and comforting tea-time snacks, we empower local restaurants and bring happiness to food lovers across town.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-red-50 text-[#E23744] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">30 Min Delivery</h3>
            <p className="text-xs text-gray-500">
              Piping hot food delivered straight from the kitchen to your dining table.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Hygienic & Verified</h3>
            <p className="text-xs text-gray-500">
              Every partner kitchen follows strict hygiene standards and fresh prep.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Authentic Taste</h3>
            <p className="text-xs text-gray-500">
              Real local flavor and unmatched quality cooked by passionate regional chefs.
            </p>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Headquarters & Operations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#E23744] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Address</p>
                <p className="text-gray-500 text-xs mt-1">Main Market, Nirmali, Supaul, Bihar - 847452</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#E23744] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Helpline</p>
                <p className="text-gray-500 text-xs mt-1">+91 8757962224</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#E23744] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Support Email</p>
                <p className="text-gray-500 text-xs mt-1">support@lele.store</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
