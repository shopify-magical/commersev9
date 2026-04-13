// app/profile/page.tsx - Profile Page
'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { User, Mail, Phone, MapPin, Lock, Bell, Shield, Save } from 'lucide-react';

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <Layout user={{ name: 'Somchai Thong', email: 'somchai@rubberplus.com', role: 'farmer' }}>
      <div className="container mx-auto px-4 py-8 section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-responsive font-bold text-primary-800">Profile Settings</h1>
            <p className="text-primary-600">Manage your account settings and preferences</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-gold border border-cream-200 p-6 md:p-8 mb-6">
            <h2 className="font-display text-xl font-bold text-primary-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Somchai Thong"
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                  <input
                    type="email"
                    defaultValue="somchai@rubberplus.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50"
                    disabled
                  />
                </div>
                <p className="text-xs text-cream-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                  <input
                    type="tel"
                    defaultValue="0812345678"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                  <input
                    type="text"
                    defaultValue="Nakhon Ratchasima, Thailand"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-2xl shadow-gold border border-cream-200 p-6 md:p-8 mb-6">
            <h2 className="font-display text-xl font-bold text-primary-800 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </h2>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-cream-200 hover:border-primary-500 hover:bg-cream-50 transition">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary-600" />
                  <div className="text-left">
                    <p className="font-semibold text-primary-800">Change Password</p>
                    <p className="text-sm text-primary-600">Last changed 30 days ago</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-cream-200 hover:border-primary-500 hover:bg-cream-50 transition">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary-600" />
                  <div className="text-left">
                    <p className="font-semibold text-primary-800">Notification Settings</p>
                    <p className="text-sm text-primary-600">Manage email and push notifications</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-all hover:scale-105 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <Save className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
