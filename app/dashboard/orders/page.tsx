"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  Square
} from 'lucide-react';

type Order = {
  id: string;
  name: string;
  phone: string;
  wilaya: string;
  commune: string;
  item: string;
  color: string;
  size: string;
  price: string;
  delivery: number;
  total: string;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  "new", 
  "confirmed", 
  "livred", 
  "need recal 1", 
  "need recal 2", 
  "cancelled", 
  "retour"
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-700';
    case 'confirmed': return 'bg-amber-100 text-amber-700';
    case 'livred': return 'bg-green-100 text-green-700';
    case 'need recal 1':
    case 'need recal 2': return 'bg-orange-100 text-orange-700';
    case 'cancelled':
    case 'retour': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update Individual Order
  const updateOrderStatus = async (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) {
      console.error("Failed to update status", error);
      fetchOrders(); 
    }
  };

  // Bulk Operations
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const toggleAll = (visibleIds: string[]) => {
    if (selectedIds.size === visibleIds.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(visibleIds));
  };

  const applyBulkUpdate = async () => {
    if (selectedIds.size === 0 || !bulkStatus) return;
    const idsToUpdate = Array.from(selectedIds);
    
    // Optimistic
    setOrders(orders.map(o => idsToUpdate.includes(o.id) ? { ...o, status: bulkStatus } : o));
    
    // DB Update
    const { error } = await supabase
      .from('orders')
      .update({ status: bulkStatus })
      .in('id', idsToUpdate);
      
    if (error) {
      alert("Bulk update failed.");
      fetchOrders();
    } else {
      setSelectedIds(new Set());
      setBulkStatus("");
    }
  };

  // Apply Search & Filters
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.phone.includes(searchQuery) ||
      o.wilaya.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

  // Reset to page 1 if filtering changes the total page count
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredOrders.length, totalPages, currentPage]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto" style={{ fontFamily: "var(--font-dm)" }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Orders Management</h2>
          <p className="text-gray-500 mt-1">Found {filteredOrders.length} matching orders.</p>
        </div>
        <button onClick={fetchOrders} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or wilaya..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F4F7FE] border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div className="flex items-center gap-2 bg-[#F4F7FE] p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${statusFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            {STATUS_OPTIONS.map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors uppercase ${statusFilter === status ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar (Appears when items are selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-2">
          <div className="text-blue-700 font-bold text-sm">
            {selectedIds.size} Order{selectedIds.size > 1 ? 's' : ''} Selected
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="" disabled>Select new status...</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
              ))}
            </select>
            <button 
              onClick={applyBulkUpdate}
              disabled={!bulkStatus}
              className="bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20"
            >
              Apply
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-gray-400 text-sm font-medium">Loading orders...</span>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-gray-400 gap-3">
              <Filter className="w-12 h-12 text-gray-200" />
              <p>No orders found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-sm">
                  <th className="py-4 px-4 w-12">
                    <button onClick={() => toggleAll(paginatedOrders.map(o => o.id))} className="text-gray-400 hover:text-blue-600">
                      {selectedIds.size === paginatedOrders.length ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                    </button>
                  </th>
                  <th className="font-medium py-4 px-4 font-dm w-24">Date</th>
                  <th className="font-medium py-4 px-4 font-dm">Customer Info</th>
                  <th className="font-medium py-4 px-4 font-dm">Location</th>
                  <th className="font-medium py-4 px-4 font-dm">Item Details</th>
                  <th className="font-medium py-4 px-4 font-dm text-right">Total Price</th>
                  <th className="font-medium py-4 px-4 font-dm text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const isSelected = selectedIds.has(order.id);
                  return (
                    <tr key={order.id} className={`border-b border-gray-50 transition-colors group ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="py-4 px-4 cursor-pointer" onClick={() => toggleSelection(order.id)}>
                        {isSelected ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-gray-300 group-hover:text-gray-400 transition-colors" />}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-gray-900">{order.name}</div>
                        <div className="text-xs text-blue-600 font-mono mt-1" dir="ltr">{order.phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-700">{order.wilaya}</div>
                        <div className="text-xs text-gray-500 mt-1">{order.commune}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-gray-800">{order.item}</div>
                        <div className="text-xs text-gray-500 mt-1">{order.color} • Size: {order.size}</div>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">{order.total}</td>
                      <td className="py-4 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`w-full appearance-none outline-none cursor-pointer px-3 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg text-center shadow-sm ${getStatusColor(order.status)}`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt} className="bg-white text-gray-900">{opt}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
