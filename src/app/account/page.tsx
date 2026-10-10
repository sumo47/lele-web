'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiUpdateProfile } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  ShoppingBag,
  Heart,
  LogOut,
  Edit2,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account');
    }
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user, loading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await apiUpdateProfile({ name, phone });
      await refreshUser();
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#E23744] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-[#E23744]/20 flex items-center justify-center text-2xl font-bold text-[#E23744]">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user.email}
                </p>
                {user.isEmailVerified && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Customer
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="mt-6 p-4 rounded-xl bg-green-50 text-green-800 text-sm flex items-center gap-2 border border-green-200">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-800 text-sm flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Edit form */}
          {isEditing && (
            <form onSubmit={handleUpdate} className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#E23744] hover:bg-[#d02835] text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/orders"
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition hover:border-red-100"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">My Orders</h3>
            <p className="text-xs text-gray-500">Track current orders & past receipts</p>
          </Link>

          <Link
            href="/addresses"
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition hover:border-red-100"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Saved Addresses</h3>
            <p className="text-xs text-gray-500">Manage delivery locations for quick checkout</p>
          </Link>

          <Link
            href="/wishlist"
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition hover:border-red-100"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">My Wishlist</h3>
            <p className="text-xs text-gray-500">Favorite dishes and top kitchens</p>
          </Link>
        </div>

        {/* Account Details Overview */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="divide-y divide-gray-100">
            <div className="py-3.5 flex justify-between text-sm">
              <span className="text-gray-500">Email Address</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="py-3.5 flex justify-between text-sm">
              <span className="text-gray-500">Phone Number</span>
              <span className="font-medium text-gray-900">{user.phone || 'Not provided'}</span>
            </div>
            <div className="py-3.5 flex justify-between text-sm">
              <span className="text-gray-500">Account Role</span>
              <span className="font-medium text-gray-900 capitalize">{user.role}</span>
            </div>
            <div className="py-3.5 flex justify-between text-sm">
              <span className="text-gray-500">Customer ID</span>
              <span className="font-mono text-xs text-gray-400">{user.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
