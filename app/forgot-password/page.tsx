// app/forgot-password/page.tsx - Forgot Password Page
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { SimpleFooter } from '@/components/layout/SimpleFooter';
import { Leaf, Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    // Handle password reset logic here
    console.log('Password reset request:', { email });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-50">
        <SimpleHeader />
        
        <main className="flex-grow flex items-center justify-center py-12 md:py-20 section-padding">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-gold p-6 md:p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-display text-2xl font-bold text-primary-800 mb-2">
                  Check Your Email
                </h2>
                <p className="text-primary-600 mb-6">
                  We've sent a password reset link to {email}. Please check your inbox.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-600 font-semibold transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </main>

        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <SimpleHeader />
      
      <main className="flex-grow flex items-center justify-center py-12 md:py-20 section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Back Link */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                <Leaf className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">
                Forgot Password?
              </h1>
              <p className="text-primary-600">Enter your email to receive a reset link</p>
            </div>

            {/* Forgot Password Form */}
            <div className="bg-white rounded-2xl shadow-gold p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <p className="text-center mt-6 text-primary-600">
                Remember your password?{' '}
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
