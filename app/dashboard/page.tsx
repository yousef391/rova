"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, 
  DollarSign, 
  CheckCircle, 
  PackageCheck 
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type Order = {
  id: string;
  wilaya: string;
  total: string;
  status: string;
  created_at: string;
};

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f97316', '#ef4444', '#8b5cf6'];

export default function DashboardStatistics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, wilaya, total, status, created_at')
          .order('created_at', { ascending: true }); // Ascending for time charts
        
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // --- Statistics Calculation ---
  const totalOrders = orders.length;
  
  // Confirmed & Livred
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const confirmedPercent = totalOrders > 0 ? ((confirmedCount / totalOrders) * 100).toFixed(1) : "0.0";
  
  const livredCount = orders.filter(o => o.status === 'livred').length;
  const livredPercent = totalOrders > 0 ? ((livredCount / totalOrders) * 100).toFixed(1) : "0.0";

  // Total Revenue
  let totalRevenue = 0;
  orders.forEach(o => {
    if (o.status !== 'cancelled' && o.status !== 'retour') {
      const amount = parseFloat(o.total.replace(/[^\d.]/g, ''));
      if (!isNaN(amount)) totalRevenue += amount;
    }
  });

  // --- Prepare Chart Data ---
  
  // 1. Revenue Over Time (Group by Date)
  const revenueByDate: Record<string, number> = {};
  orders.forEach(o => {
    if (o.status !== 'cancelled' && o.status !== 'retour') {
      const date = new Date(o.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
      const amount = parseFloat(o.total.replace(/[^\d.]/g, '')) || 0;
      revenueByDate[date] = (revenueByDate[date] || 0) + amount;
    }
  });
  const revenueChartData = Object.keys(revenueByDate).map(date => ({
    name: date,
    revenue: revenueByDate[date]
  }));

  // 2. Status Distribution Data
  const statusCounts: Record<string, number> = {};
  orders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const statusChartData = Object.keys(statusCounts).map(status => ({
    name: status.toUpperCase(),
    value: statusCounts[status]
  }));

  // 3. Top Wilayas
  const wilayaCounts: Record<string, number> = {};
  orders.forEach(o => {
    wilayaCounts[o.wilaya] = (wilayaCounts[o.wilaya] || 0) + 1;
  });
  const topWilayasData = Object.keys(wilayaCounts)
    .map(w => ({ name: w, orders: wilayaCounts[w] }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5); // Top 5

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-10" style={{ fontFamily: "var(--font-dm)" }}>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Store Analytics</h2>
        <p className="text-gray-500 mt-1">Monitor your revenue, conversions, and regional growth.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600 rounded-[1.5rem] p-6 shadow-md text-white relative overflow-hidden flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
          <div className="z-10">
            <p className="text-white/80 font-medium text-sm mb-1">Projected Revenue</p>
            <h3 className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {totalRevenue.toLocaleString()} <span className="text-xs text-white/70 font-medium uppercase tracking-wider">DA</span>
            </h3>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-4 w-24 h-24 bg-blue-500/50 rounded-full blur-xl"></div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-[#F4F7FE] rounded-2xl flex items-center justify-center text-blue-600">
              <ShoppingBag size={24} />
            </div>
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold">Total</span>
          </div>
          <div>
            <p className="text-gray-400 font-medium text-sm mb-1">Total Commandes</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <CheckCircle size={24} />
            </div>
            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">{confirmedPercent}%</span>
          </div>
          <div>
            <p className="text-gray-400 font-medium text-sm mb-1">Commandes Confirmé</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{confirmedCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <PackageCheck size={24} />
            </div>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">{livredPercent}%</span>
          </div>
          <div>
            <p className="text-gray-400 font-medium text-sm mb-1">Commandes Livré</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{livredCount}</h3>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Revenue Over Time</h3>
            <p className="text-gray-400 text-sm">Valid orders contributing to gross volume.</p>
          </div>
          <div className="h-[300px] w-full">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} DA`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex justify-center items-center text-gray-400 text-sm">Not enough data to graph yet.</div>
            )}
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Order Composition</h3>
            <p className="text-gray-400 text-sm">Total distribution of order statuses.</p>
          </div>
          <div className="h-[300px] w-full">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex justify-center items-center text-gray-400 text-sm">No statuses found.</div>
            )}
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Top Regions Bar Chart */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 lg:col-span-3">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Top 5 Wilayas</h3>
            <p className="text-gray-400 text-sm">Highest performing regions by total order volume.</p>
          </div>
          <div className="h-[300px] w-full">
            {topWilayasData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topWilayasData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 600 }} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} Orders`, 'Volume']}
                  />
                  <Bar dataKey="orders" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex justify-center items-center text-gray-400 text-sm">Not enough location data yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


