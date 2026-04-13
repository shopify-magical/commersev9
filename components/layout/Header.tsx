// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Leaf, User, Bell, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: 'farmer' | 'buyer' | 'admin';
  };
}

export const Header = ({ user }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Marketplace', href: '/marketplace', icon: '🌿' },
    { name: 'Production', href: '/production', icon: '🏭' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-gold'
          : 'bg-gradient-jade'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Leaf className={`w-8 h-8 transition-all duration-300 ${
                isScrolled ? 'text-primary-600' : 'text-white'
              } group-hover:rotate-12`} />
              <div className="absolute inset-0 bg-gold-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
            </div>
            <div>
              <span className={`font-display text-xl font-bold tracking-tight ${
                isScrolled ? 'text-primary-800' : 'text-white'
              }`}>
                Rubber
              </span>
              <span className={`font-display text-xl font-bold ${
                isScrolled ? 'text-gold-500' : 'text-gold-400'
              }`}>
                Plus
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-all duration-300 hover:scale-105 ${
                  isScrolled
                    ? 'text-primary-600 hover:text-gold-500'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className={`relative p-2 rounded-full transition-all ${
              isScrolled
                ? 'hover:bg-cream-100 text-primary-600'
                : 'hover:bg-white/10 text-white'
            }`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-3 p-2 rounded-full transition-all ${
                    isScrolled
                      ? 'hover:bg-cream-100'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <span className={isScrolled ? 'text-primary-700' : 'text-white'}>
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-gold border border-cream-200 overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-cream-100">
                      <p className="font-semibold text-primary-800">{user.name}</p>
                      <p className="text-sm text-cream-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>
                    <div className="py-2">
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-primary-600 hover:bg-cream-50 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-primary-600 hover:bg-cream-50 transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <hr className="my-1 border-cream-100" />
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-error hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    isScrolled
                      ? 'text-primary-600 hover:text-primary-700'
                      : 'text-white hover:text-gold-400'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gold-500 text-white rounded-xl font-medium hover:bg-gold-600 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-all ${
                isScrolled
                  ? 'text-primary-600'
                  : 'text-white'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-slide-up">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 py-3 text-white/90 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
