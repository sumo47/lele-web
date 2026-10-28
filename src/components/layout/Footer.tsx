'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Bike, Store } from 'lucide-react';
import { getPublicConfig } from '@/lib/api';

export default function Footer() {
  const pathname = usePathname();
  const [onboardingEnabled, setOnboardingEnabled] = useState(true);

  useEffect(() => {
    getPublicConfig()
      .then((cfg) => {
        if (cfg && cfg.partnerOnboardingEnabled === false) {
          setOnboardingEnabled(false);
        }
      })
      .catch(() => {});
  }, []);

  const isPartnerDashboard =
    pathname?.startsWith('/partner/restaurant') || pathname?.startsWith('/partner/rider');

  if (isPartnerDashboard) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-24 md:pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-red-500/30">
                <Image
                  src="/lele_logo.jpeg"
                  alt="LELE Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                LELE<span className="text-red-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Nirmali&apos;s favorite food & grocery shopping destination. Connecting you with top local kitchens, authentic restaurants, and fresh snacks with ultra-fast doorstep delivery.
            </p>
            <div className="space-y-2 text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>Station Road & Main Market, Nirmali, Supaul, Bihar - 847452</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>+91 8757962224 (Customer Support & Orders)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>support@lele.store</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-red-500 shrink-0" />
                <span>Open 7 Days a Week: 8:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-red-400 transition">Home</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-red-400 transition">Explore Restaurants</Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-red-400 transition">My Orders</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-red-400 transition">View Cart</Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-red-400 transition">Favorites</Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-red-400 transition">Customer Profile</Link>
              </li>
              {onboardingEnabled && (
                <>
                  <li className="pt-2 border-t border-gray-800">
                    <Link href="/partner/rider/apply" className="text-blue-400 hover:text-blue-300 font-medium transition flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5" /> Become a Rider
                    </Link>
                  </li>
                  <li>
                    <Link href="/partner/restaurant/apply" className="text-orange-400 hover:text-orange-300 font-medium transition flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" /> Become a Restaurant Partner
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/partner" className="text-gray-400 hover:text-gray-200 transition">
                  Partner Portal & Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cuisines */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Cuisines</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/search?q=biryani" className="hover:text-red-400 transition">Hyderabadi Biryani</Link>
              </li>
              <li>
                <Link href="/search?q=paneer" className="hover:text-red-400 transition">North Indian & Paneer</Link>
              </li>
              <li>
                <Link href="/search?q=pizza" className="hover:text-red-400 transition">Pizzas & Burgers</Link>
              </li>
              <li>
                <Link href="/search?q=samosa" className="hover:text-red-400 transition">Sweets & Snacks</Link>
              </li>
              <li>
                <Link href="/search?q=roll" className="hover:text-red-400 transition">Rolls & Wraps</Link>
              </li>
              <li>
                <Link href="/search?q=coffee" className="hover:text-red-400 transition">Beverages & Shakes</Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Support & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-red-400 transition">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-red-400 transition">Contact & Help</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-red-400 transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-red-400 transition">Terms of Service</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-red-400 transition">Refund & Cancellation</Link>
              </li>
            </ul>
            <div className="pt-3">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-800/60 p-2.5 rounded-lg border border-gray-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Safe & Secure Checkout with Cash on Delivery & UPI</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} LELE Store. All rights reserved. Made for Nirmali with <Heart className="w-3 h-3 text-red-500 inline fill-red-500" />.</p>
          <div className="flex items-center gap-4">
            <span>Cash on Delivery</span>
            <span>·</span>
            <span>UPI Payments</span>
            <span>·</span>
            <span>Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
