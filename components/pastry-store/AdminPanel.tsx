/**
 * Admin Panel with Unix Routing Endpoints
 * Administrative interface for managing the pastry store via Unix-style API
 */

import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  apiBaseUrl?: string;
}

export default function AdminPanel({ apiBaseUrl = 'https://bizcommerz-agentic-engine.sv9.workers.dev' }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [routeTree, setRouteTree] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSystemHealth();
    loadRouteTree();
  }, []);

  const loadSystemHealth = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/bin/health`);
      const data = await response.json();
      setSystemHealth(data);
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  };

  const loadRouteTree = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/routes`);
      const data = await response.json();
      setRouteTree(data);
    } catch (error) {
      console.error('Failed to load route tree:', error);
    }
  };

  const testEndpoint = async (path: string, method: string = 'GET') => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      alert(`Success!\n\nStatus: ${response.status}\n\nResponse:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const unixRoutes = [
    { path: '/bin/health', method: 'GET', description: 'System health check', category: 'bin' },
    { path: '/bin/ping', method: 'GET', description: 'Connectivity test', category: 'bin' },
    { path: '/bin/version', method: 'GET', description: 'Version information', category: 'bin' },
    { path: '/usr/bin/products', method: 'GET', description: 'Product catalog', category: 'usr' },
    { path: '/usr/bin/recommendations', method: 'POST', description: 'AI recommendations', category: 'usr' },
    { path: '/usr/bin/chat', method: 'POST', description: 'Chat interface', category: 'usr' },
    { path: '/etc/config', method: 'GET', description: 'System configuration', category: 'etc' },
    { path: '/etc/admin/dashboard', method: 'GET', description: 'Admin dashboard', category: 'etc' },
    { path: '/var/stats', method: 'GET', description: 'Runtime statistics', category: 'var' },
    { path: '/var/inventory/forecast', method: 'POST', description: 'Inventory forecasting', category: 'var' },
    { path: '/tmp/orders/optimize', method: 'POST', description: 'Order optimization', category: 'tmp' },
    { path: '/home/:tenantId/profile', method: 'GET', description: 'Tenant profile', category: 'home' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🥮</div>
              <div>
                <h1 className="text-xl font-bold">Sweet Layers Admin</h1>
                <p className="text-sm text-gray-400">Unix Routing Gateway Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {systemHealth?.status === 'healthy' && (
                <div className="flex items-center gap-2 bg-green-900 text-green-100 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  System Healthy
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 py-3">
            {['overview', 'routes', 'endpoints', 'monitoring', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-2">System Status</div>
                <div className="text-3xl font-bold text-green-400">
                  {systemHealth?.status || 'Unknown'}
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-2">Routing Architecture</div>
                <div className="text-3xl font-bold text-purple-400">
                  Unix Hierarchical
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-2">Total Routes</div>
                <div className="text-3xl font-bold text-blue-400">
                  {routeTree?.architecture ? Object.keys(routeTree.architecture.paths || {}).length : 0}
                </div>
              </div>
            </div>

            {/* Architecture Info */}
            {routeTree && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Unix Routing Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Path Structure</div>
                    <div className="space-y-2">
                      {Object.entries(routeTree.architecture?.paths || {}).map(([path, desc]: [string, any]) => (
                        <div key={path} className="flex items-center gap-2">
                          <code className="bg-gray-700 px-2 py-1 rounded text-sm">{path}</code>
                          <span className="text-gray-400 text-sm">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Features</div>
                    <div className="space-y-2">
                      {routeTree.architecture?.features?.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Unix Route Tree</h3>
              <div className="font-mono text-sm text-gray-300 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre>{routeTree?.tree || 'Loading...'}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">API Endpoints</h3>
              <div className="space-y-3">
                {unixRoutes.map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        route.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {route.method}
                      </span>
                      <code className="text-purple-400">{route.path}</code>
                      <span className="text-gray-400 text-sm">{route.description}</span>
                    </div>
                    <button
                      onClick={() => testEndpoint(route.path, route.method)}
                      disabled={loading}
                      className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      Test
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">System Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Engine Status</div>
                  <div className="text-xl font-bold text-green-400">Running</div>
                  <div className="text-xs text-gray-500 mt-1">Uptime: 99.9%</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Request Rate</div>
                  <div className="text-xl font-bold text-blue-400">1,234/hr</div>
                  <div className="text-xs text-gray-500 mt-1">Avg: 0.8ms</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Error Rate</div>
                  <div className="text-xl font-bold text-green-400">0.01%</div>
                  <div className="text-xs text-gray-500 mt-1">Last 24h</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Agentic Decisions</div>
                  <div className="text-xl font-bold text-purple-400">8,456</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">System Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">API Base URL</label>
                  <input
                    type="text"
                    value={apiBaseUrl}
                    readOnly
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Engine Name</label>
                  <input
                    type="text"
                    value="BizCommerzAgenticEngine"
                    readOnly
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Log Level</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300">
                    <option>debug</option>
                    <option selected>info</option>
                    <option>warn</option>
                    <option>error</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium">Enable Learning</div>
                    <div className="text-sm text-gray-400">Allow agentic engine to learn from interactions</div>
                  </div>
                  <div className="w-12 h-6 bg-green-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          Powered by Infinite Unix Routing & Agentic Engine v2.0.0
        </div>
      </footer>
    </div>
  );
}
