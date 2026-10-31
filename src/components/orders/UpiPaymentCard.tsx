'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { apiSubmitPaymentReference } from '@/lib/api';
import type { Order } from '@/lib/types';

interface UpiPaymentCardProps {
  order: Order;
  onOrderUpdated: (updated: Order) => void;
}

export default function UpiPaymentCard({ order, onOrderUpdated }: UpiPaymentCardProps) {
  const [copied, setCopied] = useState(false);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const payment = order.payment || {
    method: order.paymentMethod || 'COD',
    status: order.paymentStatus || 'pending',
  };

  const isUpi = payment.method === 'UPI_MANUAL' || payment.method === 'UPI';
  const isPaid = payment.status === 'paid';
  const isFailed = payment.status === 'failed';
  const hasSubmitted = Boolean(payment.reference || order.paymentReference);

  const amount = Number(order.pricing?.total || 0);
  const upiDetails = payment.details || order.paymentDetails || {};
  const upiId = upiDetails.upiId || 'merchant@upi';
  const merchantName = upiDetails.merchantName || 'LELE Store';
  const orderRef = order.orderNumber || order.id.slice(0, 8);

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&tn=${encodeURIComponent('Order ' + orderRef)}&cu=INR`;
  const qrImage = upiDetails.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

  const handleCopy = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReference = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = reference.trim();
    if (clean.length < 6) {
      setError('Please enter a valid UPI transaction reference (UTR) of at least 6 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await apiSubmitPaymentReference(order.id, clean);
      onOrderUpdated(updated);
      setSuccess('Payment reference submitted successfully! Awaiting verification.');
      setIsEditing(false);
      setReference('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment reference. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isUpi) {
    // Render COD Status Card
    return (
      <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Payment Method: Cash on Delivery (COD)</span>
          </div>
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Pay at Doorstep
          </span>
        </div>
        <p className="text-xs text-emerald-700">
          Please keep <strong className="font-extrabold">₹{amount.toFixed(2)}</strong> ready in cash or UPI QR code for the delivery partner upon arrival.
        </p>
      </div>
    );
  }

  // 1. If payment is verified
  if (isPaid) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-900 font-black text-sm sm:text-base">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>Payment Verified</span>
          </div>
          <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-emerald-200/70 text-emerald-900">
            Paid
          </span>
        </div>
        <div className="text-xs text-emerald-800 space-y-1">
          <p>
            Your payment of <strong className="font-bold">₹{amount.toFixed(2)}</strong> has been verified by the store manager.
          </p>
          {(payment.reference || order.paymentReference) && (
            <p className="text-[11px] text-emerald-700 font-mono">
              UTR / Reference: <span className="font-bold">{payment.reference || order.paymentReference}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. If payment is rejected
  if (isFailed && !isEditing) {
    return (
      <div className="bg-red-50/60 border border-red-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-900 font-black text-sm sm:text-base">
            <XCircle className="w-6 h-6 text-red-600" />
            <span>Payment Verification Rejected</span>
          </div>
          <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-red-200 text-red-900">
            Verification Failed
          </span>
        </div>
        <div className="text-xs text-red-800 space-y-1">
          <p>The merchant could not verify your submitted transaction reference.</p>
          {(payment.rejectionReason || order.paymentRejectionReason) && (
            <div className="p-3 bg-white/70 border border-red-200 rounded-xl mt-2 text-xs">
              <span className="font-bold text-red-900">Reason: </span>
              <span className="text-red-700">{payment.rejectionReason || order.paymentRejectionReason}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs font-bold text-red-700 bg-white border border-red-300 hover:bg-red-50 px-4 py-2 rounded-xl transition"
        >
          Re-submit Transaction Reference
        </button>
      </div>
    );
  }

  // 3. Payment Pending / Reference Submitted vs Need to Submit
  return (
    <div className="bg-white rounded-3xl border border-blue-100 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-base font-black text-gray-900">Manual UPI Payment</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Scan and pay the exact amount using GPay, PhonePe, Paytm, or BHIM.
          </p>
        </div>
        <div className="text-right self-start sm:self-auto">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Payable Amount</span>
          <span className="text-xl font-black text-blue-600">₹{amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Submitted Status Banner */}
      {hasSubmitted && !isEditing && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Payment Submitted — Awaiting Verification</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[11px] text-amber-800 underline font-semibold hover:text-amber-900"
            >
              Update Reference
            </button>
          </div>
          <p className="text-xs text-amber-800">
            Submitted UTR / Ref: <strong className="font-mono text-gray-900">{payment.reference || order.paymentReference}</strong>
          </p>
          <p className="text-[11px] text-amber-700">
            Our store manager will reconcile this reference in our bank statement before dispatch.
          </p>
        </div>
      )}

      {/* QR Code & Payment Instructions */}
      {(!hasSubmitted || isEditing) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* QR Code Container */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-100">
              <img
                src={qrImage}
                alt="Merchant UPI QR Code"
                className="w-44 h-44 object-contain mx-auto"
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              Scan using any UPI App
            </span>
          </div>

          {/* Details & Actions */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Merchant Account</span>
              <p className="text-sm font-black text-gray-900">{merchantName}</p>
            </div>

            {/* UPI ID copy box */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
              <div className="truncate">
                <span className="text-[10px] text-gray-400 block font-semibold">UPI ID / VPA</span>
                <span className="text-xs font-mono font-bold text-gray-800 truncate">{upiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-xs font-bold text-gray-700 rounded-lg shadow-xs transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct UPI App Intent Link (Mobile browsers) */}
            <a
              href={upiUri}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition md:hidden"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in UPI App (GPay / PhonePe / Paytm)</span>
            </a>

            <div className="text-[11px] text-gray-500 space-y-1">
              <p>1. Open your UPI application and scan the QR code (or paste the UPI ID).</p>
              <p>2. Complete the payment of exact <strong className="text-gray-900">₹{amount.toFixed(2)}</strong>.</p>
              <p>3. Copy the 12-digit UTR / Reference number from your payment confirmation and submit below.</p>
            </div>
          </div>
        </div>
      )}

      {/* Reference Submission Form */}
      {(!hasSubmitted || isEditing) && (
        <form onSubmit={handleSubmitReference} className="pt-2 border-t border-gray-100 space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-gray-900 block mb-1">
              Enter 12-Digit UPI Reference / UTR Number
            </span>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. 430198273641 or Bank Ref No"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden transition"
            />
          </label>

          {error && (
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {success}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting || !reference.trim()}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              {submitting ? 'Submitting...' : 'Submit Payment Reference'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-400 italic">
            * Submitting the reference registers your payment for verification. The order will be confirmed once verified against our bank statement.
          </p>
        </form>
      )}
    </div>
  );
}
