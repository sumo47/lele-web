'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-gray-900">Contact LELE Support</h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Need help with an order, restaurant onboarding, or have feedback? Our Nirmali operations team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Get in Touch</h2>
            <p className="text-xs text-gray-500">
              For urgent delivery queries, please call our direct hotline for instantaneous assistance.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-[#E23744] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Customer Helpline</h3>
                  <a
                    href="tel:+918757962224"
                    className="text-sm font-semibold text-[#E23744] hover:underline block mt-0.5"
                  >
                    +91 8757962224
                  </a>
                  <p className="text-[11px] text-gray-400 mt-0.5">Available 9:00 AM – 11:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Email Inquiries</h3>
                  <a
                    href="mailto:support@lele.store"
                    className="text-sm font-semibold text-gray-700 hover:text-[#E23744] block mt-0.5"
                  >
                    support@lele.store
                  </a>
                  <p className="text-[11px] text-gray-400 mt-0.5">Responses within 2-4 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Hub & Office</h3>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    Main Market Road, Near Railway Junction, Nirmali, Supaul, Bihar - 847452
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Send us a Message</h2>
            <p className="text-xs text-gray-500 mb-6">
              Drop your query and our team will get back to you shortly.
            </p>

            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Message Received!</h3>
                <p className="text-xs text-gray-500">
                  Thank you for writing to us. Our support representative will contact you via email or phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Rahul Kumar"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you today?"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#E23744] hover:bg-[#d02835] text-white text-sm font-semibold rounded-xl shadow-sm transition"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
