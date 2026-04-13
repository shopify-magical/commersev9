// app/dashboard/page.tsx - Dashboard
'use client';

import { StatCard } from '@/components/ui/StatCard';
import { Heading } from '@/components/ui/Typography';
import { Grid } from '@/components/layout/Grid';
import { TrendingUp, Leaf, DollarSign, Users, Calendar, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-cream-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="heading-responsive font-bold text-primary-800">Dashboard</h1>
              <p className="text-primary-600 mt-1">Welcome back, Somchai</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 transition">
                <Calendar className="w-4 h-4 inline mr-2" />
                This Month
              </button>
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 section-padding">
        {/* Stats Grid */}
        <Grid cols={4} gap="md" className="mb-8">
          <StatCard
            label="Total Production"
            value="฿2,450,000"
            icon={<TrendingUp className="w-6 h-6" />}
            trend={12.5}
          />
          <StatCard
            label="Active Trees"
            value="1,250"
            icon={<Leaf className="w-6 h-6" />}
            trend={5.2}
          />
          <StatCard
            label="Revenue"
            value="฿890,000"
            icon={<DollarSign className="w-6 h-6" />}
            trend={8.3}
          />
          <StatCard
            label="Active Orders"
            value="45"
            icon={<Users className="w-6 h-6" />}
            trend={-2.1}
          />
        </Grid>

        {/* Main Content Grid */}
        <Grid cols={3} gap="lg">
          {/* Production Chart Placeholder */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-cream-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
              <Heading level={2}>Production Overview</Heading>
              <select className="px-3 py-1 border border-cream-300 rounded-lg text-sm">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-64 bg-cream-50 rounded-xl flex items-center justify-center border border-cream-200">
              <div className="text-center text-primary-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <p>Production chart will be rendered here</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-cream-200">
            <Heading level={2}>Recent Activity</Heading>
            <div className="space-y-4 mt-6">
              <ActivityItem
                title="New Order Received"
                description="Order #1234 from Bangkok Rubber Co."
                time="2 hours ago"
                type="success"
              />
              <ActivityItem
                title="Production Update"
                description="Harvest completed at Plot A"
                time="5 hours ago"
                type="info"
              />
              <ActivityItem
                title="Payment Received"
                description="฿45,000 from Rubber Thailand Ltd"
                time="1 day ago"
                type="success"
              />
              <ActivityItem
                title="Low Stock Alert"
                description="Fertilizer stock below threshold"
                time="2 days ago"
                type="warning"
              />
            </div>
          </div>
        </Grid>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-cream-200">
          <Heading level={2}>Quick Actions</Heading>
          <Grid cols={4} gap="md" className="mt-6">
            <QuickActionButton
              title="Add Production"
              description="Record new harvest"
              icon={<Leaf className="w-5 h-5" />}
            />
            <QuickActionButton
              title="View Orders"
              description="Manage orders"
              icon={<Users className="w-5 h-5" />}
            />
            <QuickActionButton
              title="Analytics"
              description="View reports"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <QuickActionButton
              title="Alerts"
              description="View notifications"
              icon={<AlertCircle className="w-5 h-5" />}
            />
          </Grid>
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ title, description, time, type }: { 
  title: string; 
  description: string; 
  time: string; 
  type: 'success' | 'warning' | 'info' | 'error';
}) {
  const colors = {
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600',
    error: 'bg-red-100 text-red-600',
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-cream-50 transition">
      <div className={`w-2 h-2 rounded-full mt-2 ${colors[type].split(' ')[0]}`} />
      <div className="flex-grow">
        <p className="font-semibold text-primary-800 text-sm">{title}</p>
        <p className="text-primary-600 text-sm">{description}</p>
        <p className="text-cream-500 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ title, description, icon }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) {
  return (
    <button className="p-4 rounded-xl border border-cream-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left group">
      <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-3 group-hover:bg-primary-500 group-hover:text-white transition">
        {icon}
      </div>
      <p className="font-semibold text-primary-800 text-sm">{title}</p>
      <p className="text-primary-600 text-xs">{description}</p>
    </button>
  );
}
