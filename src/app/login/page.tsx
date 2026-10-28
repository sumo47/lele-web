'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { determinePostLoginRedirect } from '@/lib/auth-redirect';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const { user, isAuthenticated, loading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated, redirect automatically to the appropriate destination
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const targetPath = determinePostLoginRedirect(user, rawRedirect);
      router.replace(targetPath);
    }
  }, [loading, isAuthenticated, user, rawRedirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const profile = await login({ email: email.trim(), password });
      const targetPath = determinePostLoginRedirect(profile, rawRedirect);
      router.push(targetPath);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden mx-auto shadow-sm">
              <Image src="/lele_logo.jpeg" alt="LELE Logo" fill className="object-cover" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-gray-500">Sign in to your LELE Store account</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-red-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
          >
            <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="w-full border-t border-gray-200"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Or
          </span>
          <div className="w-full border-t border-gray-200"></div>
        </div>

        {/* Google Sign-In */}
        <GoogleSignInButton
          redirectPath={rawRedirect || '/'}
          mode="login"
          onError={(msg) => setErrorMsg(msg)}
        />

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Don&apos;t have an account yet? </span>
          <Link
            href={`/signup${rawRedirect && rawRedirect !== '/' ? `?redirect=${encodeURIComponent(rawRedirect)}` : ''}`}
            className="font-bold text-red-600 hover:underline"
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-12 text-center">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
