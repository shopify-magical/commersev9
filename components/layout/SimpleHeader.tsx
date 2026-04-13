// components/layout/SimpleHeader.tsx
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export const SimpleHeader = () => {
  return (
    <header className="bg-gradient-jade">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-white" />
            <div>
              <span className="font-display text-xl font-bold text-white">Rubber</span>
              <span className="font-display text-xl font-bold text-gold-400">Plus</span>
            </div>
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="text-white hover:text-gold-400 transition">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-gold-500 text-white px-4 py-2 rounded-lg hover:bg-gold-600 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
