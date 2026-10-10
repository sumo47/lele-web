import React from 'react';
import Link from 'next/link';
import { Utensils, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-red-50 text-[#E23744] rounded-3xl flex items-center justify-center mx-auto border border-red-100">
          <Utensils className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E23744]">
            404 Error
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Dish or Page Not Found
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#E23744] hover:bg-[#d02835] text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/catalog"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
          >
            Explore Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
