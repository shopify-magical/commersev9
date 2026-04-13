// app/register/page.tsx - Register Page
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { SimpleFooter } from '@/components/layout/SimpleFooter';
import { Leaf, User, Mail, Lock, Eye, EyeOff, MapPin, Phone, Check, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer' as 'farmer' | 'buyer',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{9,10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Thai phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    // Handle registration logic here
    console.log('Registration attempt:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <SimpleHeader />
      
      <main className="flex-grow py-12 md:py-20 section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                <Leaf className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-800 mb-2">
                Create Account
              </h1>
              <p className="text-primary-600">Join Thailand's smart rubber marketplace</p>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-2xl shadow-gold p-6 md:p-8">
              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary-700 mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'farmer' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.role === 'farmer'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-cream-300 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🌿</div>
                    <p className="font-semibold text-primary-800">Farmer</p>
                    <p className="text-xs text-primary-600">Sell rubber</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'buyer' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.role === 'buyer'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-cream-300 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🏭</div>
                    <p className="font-semibold text-primary-800">Buyer</p>
                    <p className="text-xs text-primary-600">Purchase rubber</p>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      placeholder="Somchai Thong"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-500' : 'border-cream-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="farmer@rubberplus.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-500' : 'border-cream-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      placeholder="0812345678"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-500' : 'border-cream-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-500' : 'border-cream-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400 hover:text-primary-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 mt-1 rounded border-cream-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="text-sm text-primary-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-gold-500 hover:text-gold-600 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-gold-500 hover:text-gold-600 font-medium">
                  Privacy Policy
                </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <p className="text-center mt-6 text-primary-600">
                Already have an account?{' '}
                <Link href="/login" className="text-gold-500 hover:text-gold-600 font-semibold transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}
