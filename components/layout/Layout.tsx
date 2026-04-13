// components/layout/Layout.tsx
'use client';

import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';

interface LayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
    role: 'farmer' | 'buyer' | 'admin';
  };
}

export const Layout = ({ children, user }: LayoutProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-grow pt-16 md:pt-20">
        {children}
      </main>
      <Footer />
      <ChatWidget isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
};
