'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiSendEmailVerification, apiVerifyEmail } from '@/lib/api';
import { ShieldCheck, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await apiVerifyEmail({ otp });
      await refreshUser();
      setIsVerified(true);
      setTimeout(() => {
        router.push('/account');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await apiSendEmailVerification();
      setSuccessMsg('A fresh verification code has been dispatched to your email.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch code. Try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 text-[#E23744] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-xs text-gray-500 mt-2">
            We sent a 6-digit confirmation code to{' '}
            <span className="font-semibold text-gray-800">{user?.email || 'your registered email'}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 text-red-800 text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-green-50 text-green-800 text-xs flex items-center gap-2 border border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {isVerified ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Email Verified Successfully!</h2>
            <p className="text-xs text-gray-500">Redirecting to your account dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E23744]"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#E23744] hover:bg-[#d02835] text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify Email
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-semibold text-gray-600 hover:text-[#E23744] transition disabled:opacity-50"
              >
                {resending ? 'Sending...' : "Didn't receive code? Resend OTP"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
