// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Sidebar - Fixed width */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-cream-200 hidden lg:block">
        {/* Sidebar content */}
        <div className="p-6">
          <h2 className="font-display text-xl font-bold text-primary-800 mb-6">Dashboard</h2>
          <nav className="space-y-2">
            <a href="/dashboard" className="block px-4 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium">
              Overview
            </a>
            <a href="/dashboard/production" className="block px-4 py-2 rounded-lg hover:bg-cream-50 text-primary-600 transition">
              Production
            </a>
            <a href="/dashboard/orders" className="block px-4 py-2 rounded-lg hover:bg-cream-50 text-primary-600 transition">
              Orders
            </a>
            <a href="/dashboard/analytics" className="block px-4 py-2 rounded-lg hover:bg-cream-50 text-primary-600 transition">
              Analytics
            </a>
          </nav>
        </div>
      </aside>

      {/* Main content - Flexible width */}
      <main className="lg:ml-64">
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
          {/* Max width for content */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
