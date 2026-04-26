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

  const totalOrders = orders.length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const confirmedPercent = totalOrders > 0 ? ((confirmedCount / totalOrders) * 100).toFixed(1) : "0.0";
  const livredCount = orders.filter(o => o.status === 'livred').length;
  const livredPercent = totalOrders > 0 ? ((livredCount / totalOrders) * 100).toFixed(1) : "0.0";

  let totalRevenue = 0;
  orders.forEach(o => {
    if (o.status !== 'cancelled' && o.status !== 'retour') {
      const amount = parseFloat(o.total.replace(/[^\d.]/g, ''));
      if (!isNaN(amount)) totalRevenue += amount;
    }
  });

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

  const statusCounts: Record<string, number> = {};
  orders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const statusChartData = Object.keys(statusCounts).map(status => ({
    name: status.toUpperCase(),
    value: statusCounts[status]
  }));

  const wilayaCounts: Record<string, number> = {};
  orders.forEach(o => {
    wilayaCounts[o.wilaya] = (wilayaCounts[o.wilaya] || 0) + 1;
  });
  const topWilayasData = Object.keys(wilayaCounts)
    .map(w => ({ name: w, orders: wilayaCounts[w] }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-blue-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 lg:gap-8 w-full max-w-7xl mx-auto pb-10" style={{ fontFamily: "var(--font-dm)" }}>
      
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Store Analytics</h2>
        <p className="text-gray-500 mt-1 text-sm">Monitor your revenue, conversions, and regional growth.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Revenue Card */}
        <div className="col-span-2 lg:col-span-1 bg-blue-600 rounded-2xl p-4 lg:p-5 text-white relative overflow-hidden flex flex-col justify-between h-[120px] lg:h-[140px]">
          <div className="flex justify-between items-start z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <DollarSign size={20} className="text-white" />
            </div>
          </div>
          <div className="z-10">
            <p className="text-white/70 font-medium text-xs mb-0.5">Projected Revenue</p>
            <h3 className="text-xl lg:text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {totalRevenue.toLocaleString()} <span className="text-[10px] text-white/60 font-medium uppercase">DA</span>
            </h3>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="bg-[#141720] rounded-2xl p-4 lg:p-5 border border-white/5 flex flex-col justify-between h-[120px] lg:h-[140px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-blue-600/15 rounded-xl flex items-center justify-center text-blue-400">
              <ShoppingBag size={18} />
            </div>
            <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">Total</span>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-xs mb-0.5">Total Commandes</p>
            <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{totalOrders}</h3>
          </div>
        </div>

        <div className="bg-[#141720] rounded-2xl p-4 lg:p-5 border border-white/5 flex flex-col justify-between h-[120px] lg:h-[140px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center text-amber-400">
              <CheckCircle size={18} />
            </div>
            <span className="bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">{confirmedPercent}%</span>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-xs mb-0.5">Confirmé</p>
            <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{confirmedCount}</h3>
          </div>
        </div>

        <div className="bg-[#141720] rounded-2xl p-4 lg:p-5 border border-white/5 flex flex-col justify-between h-[120px] lg:h-[140px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-400">
              <PackageCheck size={18} />
            </div>
            <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">{livredPercent}%</span>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-xs mb-0.5">Livré</p>
            <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{livredCount}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Revenue Area Chart */}
        <div className="bg-[#141720] rounded-2xl p-4 lg:p-6 border border-white/5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm lg:text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Revenue Over Time</h3>
            <p className="text-gray-500 text-xs">Valid orders contributing to gross volume.</p>
          </div>
          <div className="h-[200px] lg:h-[280px] w-full">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e2130', color: '#fff', fontSize: '13px' }}
                    formatter={(value) => [`${value} DA`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex justify-center items-center text-gray-600 text-sm">Not enough data yet.</div>
            )}
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-[#141720] rounded-2xl p-4 lg:p-6 border border-white/5">
          <div className="mb-2">
            <h3 className="text-sm lg:text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Order Composition</h3>
            <p className="text-gray-500 text-xs">Distribution of order statuses.</p>
          </div>
          <div className="h-[200px] lg:h-[260px] w-full">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e2130', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex justify-center items-center text-gray-600 text-sm">No data.</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {statusChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Top Regions Bar Chart */}
        <div className="bg-[#141720] rounded-2xl p-4 lg:p-6 border border-white/5 lg:col-span-3">
          <div className="mb-4">
            <h3 className="text-sm lg:text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Top 5 Wilayas</h3>
            <p className="text-gray-500 text-xs">Highest performing regions by total order volume.</p>
          </div>
          <div className="h-[200px] lg:h-[280px] w-full">
            {topWilayasData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topWilayasData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dx={-5} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e2130', color: '#fff' }}
                    formatter={(value) => [`${value} Orders`, 'Volume']}
                  />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex justify-center items-center text-gray-600 text-sm">Not enough data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
