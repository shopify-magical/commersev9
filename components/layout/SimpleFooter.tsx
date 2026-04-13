// components/layout/SimpleFooter.tsx
import { Leaf } from 'lucide-react';

export const SimpleFooter = () => {
  return (
    <footer className="bg-primary-900 py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-4">
          <Leaf className="w-6 h-6 text-gold-400" />
        </div>
        <p className="text-cream-300 text-sm">
          © {new Date().getFullYear()} Rubber Plus. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
