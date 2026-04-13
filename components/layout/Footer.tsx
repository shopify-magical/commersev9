// components/layout/Footer.tsx
import Link from 'next/link';
import { Leaf, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Marketplace', href: '/marketplace' },
        { name: 'Production', href: '/production' },
        { name: 'Analytics', href: '/analytics' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press', href: '/press' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Documentation', href: '/docs' },
        { name: 'API Reference', href: '/api' },
        { name: 'Status', href: '/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'GDPR', href: '/gdpr' },
      ],
    },
  ];

  return (
    <footer className="bg-primary-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-8 h-8 text-gold-400" />
              <div>
                <span className="font-display text-xl font-bold">Rubber</span>
                <span className="font-display text-xl font-bold text-gold-400">Plus</span>
              </div>
            </div>
            <p className="text-cream-300 text-sm mb-6 leading-relaxed">
              Empowering rubber farmers with technology. Increase yield, reduce costs, 
              and connect directly with buyers.
            </p>
            <div className="flex gap-3">
              <SocialIcon href="#" icon={<Facebook className="w-4 h-4" />} />
              <SocialIcon href="#" icon={<Twitter className="w-4 h-4" />} />
              <SocialIcon href="#" icon={<Linkedin className="w-4 h-4" />} />
              <SocialIcon href="#" icon={<Instagram className="w-4 h-4" />} />
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-cream-300 hover:text-gold-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info Bar */}
        <div className="mt-12 pt-8 border-t border-primary-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 text-cream-300">
              <Mail className="w-5 h-5 text-gold-400" />
              <span className="text-sm">support@rubberplus.com</span>
            </div>
            <div className="flex items-center gap-3 text-cream-300">
              <Phone className="w-5 h-5 text-gold-400" />
              <span className="text-sm">+66 (0) 2 123 4567</span>
            </div>
            <div className="flex items-center gap-3 text-cream-300">
              <MapPin className="w-5 h-5 text-gold-400" />
              <span className="text-sm">Bangkok, Thailand</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-primary-700 text-center">
          <p className="text-cream-400 text-xs">
            © {currentYear} Rubber Plus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Social Icon Component
const SocialIcon = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a
    href={href}
    className="w-8 h-8 rounded-full bg-primary-700 hover:bg-gold-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
    target="_blank"
    rel="noopener noreferrer"
  >
    {icon}
  </a>
);
