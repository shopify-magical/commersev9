// app/page.tsx - Homepage
'use client';

import { useState } from 'react';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { SimpleFooter } from '@/components/layout/SimpleFooter';
import { Grid } from '@/components/layout/Grid';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { Leaf, TrendingUp, Shield, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleHeader />
      
      {/* Hero Section */}
      <section className="flex-grow bg-gradient-jade text-white section-padding relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="hero-luxury-layer absolute inset-0" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Leaf className="w-16 h-16 text-gold-400" />
                <div className="absolute inset-0 bg-gold-400/30 rounded-full blur-2xl" />
              </div>
            </div>
            
            {/* Hero Luxury Layers */}
            <div className="relative mb-8 mx-auto max-w-4xl h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-jade/90 to-jade">
              <img 
                src="/images/hero-pastry.webp" 
                alt="Premium Rubber Products"
                className="absolute inset-0 w-full h-full object-cover hero-luxury-image z-10"
              />
              <div className="absolute inset-0 z-20">
                <img 
                  src="/images/hero-luxury-layers.svg" 
                  alt="Luxury Design Layers"
                  className="w-full h-full object-cover hero-luxury-layers mix-blend-multiply"
                />
              </div>
              <div className="absolute inset-0 z-30 hero-luxury-overlay rounded-2xl" />
            </div>
            <h1 className="heading-responsive font-bold mb-6 tracking-tight">
              Smart Rubber
              <span className="text-gold-400"> Management</span>
            </h1>
            <p className="text-responsive text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Empowering rubber farmers with technology. Increase yield, reduce costs, 
              and connect directly with buyers in Thailand's digital marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-gold-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gold-600 transition-all hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/login"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20 inline-flex items-center justify-center"
              >
                View Demo
              </a>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/20">
              <div>
                <p className="font-mono text-3xl md:text-4xl font-bold text-gold-400">10K+</p>
                <p className="text-white/70 mt-2">Active Farmers</p>
              </div>
              <div>
                <p className="font-mono text-3xl md:text-4xl font-bold text-gold-400">฿500M+</p>
                <p className="text-white/70 mt-2">Trade Volume</p>
              </div>
              <div>
                <p className="font-mono text-3xl md:text-4xl font-bold text-gold-400">25%</p>
                <p className="text-white/70 mt-2">Yield Increase</p>
              </div>
              <div>
                <p className="font-mono text-3xl md:text-4xl font-bold text-gold-400">98%</p>
                <p className="text-white/70 mt-2">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-cream-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-responsive font-bold text-primary-800 mb-4">
              Why Choose Rubber Plus?
            </h2>
            <p className="text-lg text-primary-600 max-w-2xl mx-auto">
              Built specifically for Thailand's rubber industry with cutting-edge technology
            </p>
          </div>
          
          <Grid cols={3} gap="lg" className="max-w-6xl mx-auto">
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Increase Yield"
              description="AI-powered insights and best practices to optimize your rubber plantation productivity"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure Trading"
              description="Direct connection with verified buyers, transparent pricing, and secure payments"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Community Support"
              description="Join thousands of farmers sharing knowledge, resources, and market opportunities"
            />
          </Grid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="heading-responsive font-bold mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-responsive text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of Thai farmers already using Rubber Plus to grow their business
          </p>
          <a
            href="/register"
            className="bg-gold-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gold-600 transition-all hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      <SimpleFooter />
      <ChatWidget isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-cream-200 hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
      <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 mb-6">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-bold text-primary-800 mb-3">{title}</h3>
      <p className="text-primary-600 leading-relaxed">{description}</p>
    </div>
  );
}
