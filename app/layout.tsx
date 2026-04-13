// app/layout.tsx
import { Layout } from '@/components/layout/Layout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Get user from session (example)
  const user = {
    name: 'Somchai Thong',
    email: 'farmer@rubberplus.com',
    role: 'farmer' as const,
  };

  return (
    <html lang="en">
      <body>
        <Layout user={user}>
          {children}
        </Layout>
      </body>
    </html>
  );
}
