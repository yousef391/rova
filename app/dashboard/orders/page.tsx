"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  Square,
  Trash2,
  X
} from 'lucide-react';
import algeriaData from '@/data/algeria.json';

type Order = {
  id: string;
  order_number?: number;
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
  tracking_id?: string;
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

  // Yalidine Operations
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [editingDispatchOrder, setEditingDispatchOrder] = useState<Order | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dispatchData, setDispatchData] = useState<any>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const deleteOrder = async (orderId: string, trackingId?: string | null) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    setDeletingId(orderId);
    try {
      const res = await fetch('/api/yalidine', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, trackingId })
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to delete order from API");
      }
      
      setOrders(prev => prev.filter(o => o.id !== orderId));
      fetchOrders(); // Force refresh to be absolutely certain it's gone from UI
    } catch (err: unknown) {
      console.error(err);
      alert(`Failed to delete order. Error: ${err instanceof Error ? err.message : 'Unknown server error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const openDispatchModal = (order: Order) => {
    setEditingDispatchOrder(order);
    
    // Attempt to extract the default wilaya ID from the string "16 - Alger"
    const wilayaMatch = order.wilaya.match(/^(\d+)/);
    const defaultWilayaId = wilayaMatch ? wilayaMatch[1] : "";

    setDispatchData({
      name: order.name,
      phone: order.phone,
      wilaya: defaultWilayaId || order.wilaya,
      commune: order.commune,
      address: order.commune || "", 
      price: parseInt(order.price.replace(/[^\d]/g, ''), 10) || 0, // ONLY PRODUCT PRICE
      do_insurance: true, // Default true
      declared_value: parseInt(order.price.replace(/[^\d]/g, ''), 10) || 0,
      weight: 1, // Default 1
      is_stopdesk: false,
      stopdesk_id: "",
      autorisation_ouverture: false
    });
  };

  const communesForWilaya = dispatchData.wilaya ? algeriaData.communes.filter((c: { commune_id: number; wilaya_id: string; commune_name_latin: string }) => c.wilaya_id.toString() === dispatchData.wilaya.toString()) : [];

  const pushToYalidine = async () => {
    if (!editingDispatchOrder) return;
    setPushingId(editingDispatchOrder.id);
    try {
      const res = await fetch('/api/yalidine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: editingDispatchOrder.id,
          overrides: dispatchData
        })
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        alert(data.error || "Failed to push to Yalidine.");
      } else {
        alert(`Successfully dispatched! Tracking ID: ${data.tracking_id}`);
        setOrders(orders.map(o => o.id === editingDispatchOrder.id ? { ...o, tracking_id: data.tracking_id } : o));
        setEditingDispatchOrder(null);
      }
    } catch (err) {
      console.error(err);
      alert("Network error pushing to Yalidine.");
    } finally {
      setPushingId(null);
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
                  <th className="font-medium py-4 px-4 font-dm text-center">Shipping</th>
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
                        <div className="flex items-baseline gap-2">
                          <div className="text-sm font-bold text-gray-900">{order.name}</div>
                          {order.order_number && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">#{order.order_number}</span>}
                        </div>
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
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {order.tracking_id ? (
                            <div className="flex flex-col items-center gap-1 min-w-[100px]">
                              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tracking</span>
                              <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{order.tracking_id}</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => openDispatchModal(order)}
                              disabled={pushingId === order.id}
                              className="bg-[#e11d48] hover:bg-[#be123c] text-white disabled:opacity-50 text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-sm shadow-[#e11d48]/20 whitespace-nowrap min-w-[100px]"
                            >
                              {pushingId === order.id ? "Pushing..." : "Send Yalidine"}
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteOrder(order.id, order.tracking_id); }}
                            disabled={deletingId === order.id}
                            className="bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 disabled:opacity-50 p-2 rounded-lg transition-colors flex shrink-0"
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

      {/* Yalidine Dispatch Modal */}
      {editingDispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Confirm Dispatch</h3>
              <button onClick={() => setEditingDispatchOrder(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Name</label>
                  <input 
                    type="text" 
                    value={dispatchData.name} 
                    onChange={e => setDispatchData({...dispatchData, name: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={dispatchData.phone} 
                    onChange={e => setDispatchData({...dispatchData, phone: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Wilaya</label>
                  <select
                    value={dispatchData.wilaya}
                    onChange={(e) => setDispatchData({ ...dispatchData, wilaya: e.target.value, commune: '' })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-black appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Sélectionner Wilaya</option>
                    {algeriaData.wilayas.map((w: { wilaya_id: string; wilaya_name_latin: string }) => (
                      <option key={w.wilaya_id} value={w.wilaya_id} className="text-black">{w.wilaya_id} - {w.wilaya_name_latin}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Commune</label>
                  <select
                    value={dispatchData.commune}
                    onChange={(e) => setDispatchData({ ...dispatchData, commune: e.target.value })}
                    disabled={!dispatchData.wilaya}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-black appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled>Sélectionner Commune</option>
                    {communesForWilaya.map((c: { commune_id: number; commune_name_latin: string; wilaya_id: string }) => (
                      <option key={c.commune_id} value={c.commune_name_latin} className="text-black">{c.commune_name_latin}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Detailed Address</label>
                  <input 
                    type="text" 
                    value={dispatchData.address} 
                    onChange={e => setDispatchData({...dispatchData, address: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                  />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Price</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={dispatchData.price} 
                      onChange={e => {
                        const newPrice = parseInt(e.target.value) || 0;
                        setDispatchData({...dispatchData, price: newPrice, declared_value: newPrice});
                      }} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-black font-mono font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">DA</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dépasse 5kg?</label>
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-400 font-medium cursor-not-allowed">
                    Non, Poids évalué à 1 KG
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Insurance</label>
                  <select 
                    value={dispatchData.do_insurance ? "yes" : "no"} 
                    onChange={e => setDispatchData({...dispatchData, do_insurance: e.target.value === "yes"})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-black appearance-none cursor-pointer"
                  >
                    <option value="yes">Yes (0% fee)</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {dispatchData.do_insurance && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Declared Value</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={dispatchData.declared_value} 
                        onChange={e => setDispatchData({...dispatchData, declared_value: parseInt(e.target.value) || 0})} 
                        className="w-full bg-blue-50 border border-blue-200 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-blue-900 font-mono font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 text-xs font-bold">DA</span>
                    </div>
                    <p className="text-[10px] text-blue-600 mt-1">Full refund on this value if lost.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Shipping Method</label>
                  <select 
                    value={dispatchData.is_stopdesk ? "stopdesk" : "home"} 
                    onChange={e => setDispatchData({...dispatchData, is_stopdesk: e.target.value === "stopdesk"})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-black appearance-none cursor-pointer"
                  >
                    <option value="home">Tarif à domicile</option>
                    <option value="stopdesk">Tarif stop-desk</option>
                  </select>
                </div>
              </div>

              {dispatchData.is_stopdesk && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl animate-in slide-in-from-top-2 mt-4">
                  <label className="block text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">Stop Desk ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 160001"
                    value={dispatchData.stopdesk_id} 
                    onChange={e => setDispatchData({...dispatchData, stopdesk_id: e.target.value})} 
                    className="w-full bg-white border border-orange-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                  />
                  <p className="text-[10px] text-orange-600 mt-1">Check Yalidine Dashboard for exact Center IDs.</p>
                </div>
              )}

              {/* Autorisation d'ouverture */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Autorisation d&apos;ouverture</label>
                  <p className="text-[10px] text-gray-500 mt-0.5">Le client peut ouvrir le colis avant paiement.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDispatchData({...dispatchData, autorisation_ouverture: !dispatchData.autorisation_ouverture})}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                    dispatchData.autorisation_ouverture ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    dispatchData.autorisation_ouverture ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setEditingDispatchOrder(null)}
                className="px-6 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={pushToYalidine}
                disabled={pushingId === editingDispatchOrder.id}
                className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-[#e11d48] hover:bg-[#be123c] transition-colors shadow-md shadow-[#e11d48]/20 flex items-center justify-center min-w-[140px]"
              >
                {pushingId === editingDispatchOrder.id ? "Dispatching..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
