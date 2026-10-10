'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiForgotPassword } from '@/lib/api';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await apiForgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to process reset request. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-6 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-xs text-gray-500 mt-2">
            No worries! Enter your registered email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 text-red-800 text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {errorMsg}
          </div>
        )}

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Reset Code Dispatched</h2>
              <p className="text-xs text-gray-500 mt-1">
                If an account exists for <span className="font-semibold text-gray-800">{email}</span>, a 6-digit OTP code has been sent.
              </p>
            </div>
            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#E23744] hover:bg-[#d02835] text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              Enter Reset Code
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#E23744] hover:bg-[#d02835] text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Reset Code
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
