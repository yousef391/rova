"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  Square,
  Trash2,
  X,
  Copy,
  Check,
  Pencil
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
    case 'new': return 'bg-blue-500/20 text-blue-400';
    case 'confirmed': return 'bg-amber-500/20 text-amber-400';
    case 'livred': return 'bg-emerald-500/20 text-emerald-400';
    case 'need recal 1':
    case 'need recal 2': return 'bg-orange-500/20 text-orange-400';
    case 'cancelled':
    case 'retour': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
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
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Edit Order
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editForm, setEditForm] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      name: order.name,
      phone: order.phone,
      wilaya: order.wilaya,
      commune: order.commune,
      item: order.item,
      color: order.color,
      size: order.size,
      price: order.price,
      total: order.total,
    });
  };

  const saveEditOrder = async () => {
    if (!editingOrder) return;
    setSavingEdit(true);
    try {
      const updates = {
        name: editForm.name,
        phone: editForm.phone,
        wilaya: editForm.wilaya,
        commune: editForm.commune,
        item: editForm.item,
        color: editForm.color,
        size: editForm.size,
        price: editForm.price,
        total: editForm.total,
      };
      // Optimistic update
      setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...updates } : o));
      const { error } = await supabase.from('orders').update(updates).eq('id', editingOrder.id);
      if (error) {
        console.error("Failed to update order", error);
        alert("Failed to save changes.");
        fetchOrders();
      }
      setEditingOrder(null);
    } catch (err) {
      console.error(err);
      alert("Error saving order.");
    } finally {
      setSavingEdit(false);
    }
  };

  const copyPhone = useCallback((phone: string) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 1500);
    });
  }, []);

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
    
    // Parse the base product price and automatically reduce it by 200 DA
    const originalPrice = parseInt(order.price.replace(/[^\d]/g, ''), 10) || 0;
    const reducedPrice = Math.max(0, originalPrice - 200);

    setDispatchData({
      name: order.name,
      phone: order.phone,
      wilaya: defaultWilayaId || order.wilaya,
      commune: order.commune,
      address: order.commune || "", 
      product_list: `${order.item} - ${order.color} - ${order.size}`,
      price: reducedPrice, // Product price reduced by 200 DA
      do_insurance: true, // Default true
      declared_value: reducedPrice, // Also reduced
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
    <div className="flex flex-col gap-3 lg:gap-6 w-full max-w-7xl mx-auto" style={{ fontFamily: "var(--font-dm)" }}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg lg:text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Commandes</h2>
          <p className="text-gray-500 text-xs lg:text-sm">{filteredOrders.length} résultats</p>
        </div>
        <button onClick={fetchOrders} className="bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
          {loading ? "..." : "Refresh"}
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141720] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 text-gray-200 placeholder:text-gray-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#141720] border border-white/5 rounded-lg px-3 py-2 text-xs font-bold text-gray-300 outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer min-w-[90px] text-center uppercase"
        >
          <option value="all">All</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Desktop-only pill filters */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            All
          </button>
          {STATUS_OPTIONS.map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors uppercase whitespace-nowrap ${statusFilter === status ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar (Appears when items are selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5 lg:p-4 flex items-center justify-between gap-2">
          <span className="text-blue-400 font-bold text-xs">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-1.5">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-[#141720] border border-white/10 text-gray-200 text-xs rounded-lg px-2 py-1.5 outline-none"
            >
              <option value="" disabled>Status...</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
              ))}
            </select>
            <button 
              onClick={applyBulkUpdate}
              disabled={!bulkStatus}
              className="bg-blue-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Apply
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-gray-500 hover:text-gray-300 p-1.5 text-xs font-bold"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Orders */}
      <div className="bg-[#141720] rounded-xl lg:rounded-2xl p-2 lg:p-5 border border-white/5">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 gap-3">
            <div className="w-6 h-6 border-3 border-blue-900 border-t-blue-400 rounded-full animate-spin"></div>
            <span className="text-gray-600 text-xs">Loading...</span>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 text-gray-600 gap-2">
            <Filter className="w-10 h-10 text-gray-700" />
            <p className="text-sm">No orders found.</p>
          </div>
        ) : (
          <>
            {/* ===== MOBILE CARD VIEW ===== */}
            <div className="md:hidden flex flex-col gap-1.5">
              {paginatedOrders.map((order) => {
                const isSelected = selectedIds.has(order.id);
                return (
                  <div key={order.id} className={`rounded-lg border p-2.5 transition-colors ${isSelected ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/[0.03] bg-transparent'}`}>
                    {/* Row 1: name + price */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <button onClick={() => toggleSelection(order.id)} className="shrink-0 p-0.5">
                          {isSelected ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} className="text-gray-700" />}
                        </button>
                        <span className="text-[13px] font-semibold text-white truncate">{order.name}</span>
                        {order.order_number && <span className="text-[9px] font-bold text-blue-400 bg-blue-500/15 px-1 py-px rounded shrink-0">#{order.order_number}</span>}
                      </div>
                      <span className="text-[13px] font-bold text-white shrink-0 tabular-nums">{order.total}</span>
                    </div>
                    {/* Row 2: phone + meta */}
                    <div className="flex items-center justify-between gap-2 mb-2 ml-7">
                      <button onClick={() => copyPhone(order.phone)} className="flex items-center gap-1 group shrink-0">
                        <span className="text-[11px] text-blue-400 font-mono" dir="ltr">{order.phone}</span>
                        {copiedPhone === order.phone ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className="text-gray-700 group-active:text-blue-400" />}
                      </button>
                      <div className="text-[10px] text-gray-600 truncate text-right">
                        {order.wilaya} · {order.color} · {order.size}
                      </div>
                    </div>
                    {/* Row 3: status + actions — compact inline */}
                    <div className="flex items-center gap-1.5 ml-7">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`flex-1 appearance-none outline-none cursor-pointer px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded text-center ${getStatusColor(order.status)}`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt} className="bg-[#141720] text-gray-200">{opt}</option>
                        ))}
                      </select>
                      {order.tracking_id ? (
                        <span className="text-[9px] font-mono font-bold text-gray-500 bg-white/5 px-1.5 py-1.5 rounded truncate max-w-[80px]">{order.tracking_id}</span>
                      ) : (
                        <button 
                          onClick={() => openDispatchModal(order)}
                          disabled={pushingId === order.id}
                          className="bg-[#e11d48] text-white disabled:opacity-50 text-[10px] font-bold px-2.5 py-1.5 rounded transition-colors whitespace-nowrap shrink-0"
                        >
                          {pushingId === order.id ? "..." : "Yalidine"}
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(order)}
                        className="bg-white/5 hover:bg-blue-500/20 text-gray-600 hover:text-blue-400 p-1.5 rounded transition-colors shrink-0"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id, order.tracking_id)}
                        disabled={deletingId === order.id}
                        className="bg-white/5 hover:bg-red-500/20 text-gray-600 hover:text-red-400 disabled:opacity-50 p-1.5 rounded transition-colors shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ===== DESKTOP TABLE VIEW ===== */}
            <div className="hidden md:block overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-sm">
                  <th className="py-4 px-4 w-12">
                    <button onClick={() => toggleAll(paginatedOrders.map(o => o.id))} className="text-gray-500 hover:text-blue-400">
                      {selectedIds.size === paginatedOrders.length ? <CheckSquare size={20} className="text-blue-400" /> : <Square size={20} />}
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
                    <tr key={order.id} className={`border-b border-white/5 transition-colors group ${isSelected ? 'bg-blue-500/5' : 'hover:bg-white/[0.02]'}`}>
                      <td className="py-4 px-4 cursor-pointer" onClick={() => toggleSelection(order.id)}>
                        {isSelected ? <CheckSquare size={20} className="text-blue-400" /> : <Square size={20} className="text-gray-600 group-hover:text-gray-500 transition-colors" />}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-2">
                          <div className="text-sm font-bold text-white">{order.name}</div>
                          {order.order_number && <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">#{order.order_number}</span>}
                        </div>
                        <button onClick={() => copyPhone(order.phone)} className="flex items-center gap-1.5 mt-1 group/phone">
                          <span className="text-xs text-blue-400 font-mono" dir="ltr">{order.phone}</span>
                          {copiedPhone === order.phone ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-gray-600 group-hover/phone:text-blue-400 transition-colors" />}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-300">{order.wilaya}</div>
                        <div className="text-xs text-gray-500 mt-1">{order.commune}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-gray-200">{order.item}</div>
                        <div className="text-xs text-gray-500 mt-1">{order.color} • Size: {order.size}</div>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-white text-right whitespace-nowrap">{order.total}</td>
                      <td className="py-4 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`w-full appearance-none outline-none cursor-pointer px-3 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg text-center ${getStatusColor(order.status)}`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt} className="bg-[#141720] text-gray-200">{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {order.tracking_id ? (
                            <div className="flex flex-col items-center gap-1 min-w-[100px]">
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tracking</span>
                              <span className="text-xs font-mono font-bold text-gray-300 bg-white/5 px-2 py-1 rounded">{order.tracking_id}</span>
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
                            onClick={(e) => { e.stopPropagation(); openEditModal(order); }}
                            className="bg-white/5 hover:bg-blue-500/20 text-gray-500 hover:text-blue-400 p-2 rounded-lg transition-colors flex shrink-0"
                            title="Edit Order"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteOrder(order.id, order.tracking_id); }}
                            disabled={deletingId === order.id}
                            className="bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 disabled:opacity-50 p-2 rounded-lg transition-colors flex shrink-0"
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
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-3 lg:mt-6 flex items-center justify-between border-t border-white/5 pt-3">
            <span className="text-[10px] lg:text-sm text-gray-600">
              {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredOrders.length)} / {filteredOrders.length}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-white/10 text-gray-500 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-6 h-6 lg:w-8 lg:h-8 rounded text-[10px] lg:text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-white/10 text-gray-500 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Yalidine Dispatch Modal */}
      {editingDispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#141720] rounded-t-[1.5rem] md:rounded-2xl w-full md:max-w-xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto shadow-2xl p-5 md:p-8 border border-white/5">
            <div className="flex justify-between items-center mb-5 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Confirm Dispatch</h3>
              <button onClick={() => setEditingDispatchOrder(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Name</label>
                  <input 
                    type="text" 
                    value={dispatchData.name} 
                    onChange={e => setDispatchData({...dispatchData, name: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={dispatchData.phone} 
                    onChange={e => setDispatchData({...dispatchData, phone: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Wilaya</label>
                  <select
                    value={dispatchData.wilaya}
                    onChange={(e) => setDispatchData({ ...dispatchData, wilaya: e.target.value, commune: '' })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Sélectionner Wilaya</option>
                    {algeriaData.wilayas.map((w: { wilaya_id: string; wilaya_name_latin: string }) => (
                      <option key={w.wilaya_id} value={w.wilaya_id} className="bg-[#141720] text-gray-200">{w.wilaya_id} - {w.wilaya_name_latin}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Commune</label>
                  <select
                    value={dispatchData.commune}
                    onChange={(e) => setDispatchData({ ...dispatchData, commune: e.target.value })}
                    disabled={!dispatchData.wilaya}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled>Sélectionner Commune</option>
                    {communesForWilaya.map((c: { commune_id: number; commune_name_latin: string; wilaya_id: string }) => (
                      <option key={c.commune_id} value={c.commune_name_latin} className="bg-[#141720] text-gray-200">{c.commune_name_latin}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Detailed Address</label>
                  <input 
                    type="text" 
                    value={dispatchData.address} 
                    onChange={e => setDispatchData({...dispatchData, address: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
              </div>

              <div>
                 <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Nom du Produit</label>
                  <input 
                    type="text" 
                    value={dispatchData.product_list || ''} 
                    onChange={e => setDispatchData({...dispatchData, product_list: e.target.value})} 
                    placeholder="Ex: Jacket Nova - Noir - XL"
                    className="w-full bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Ce nom sera envoyé comme description du contenu à Yalidine.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Price</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={dispatchData.price} 
                      onChange={e => {
                        const newPrice = parseInt(e.target.value) || 0;
                        setDispatchData({...dispatchData, price: newPrice, declared_value: newPrice});
                      }} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">DA</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dépasse 5kg?</label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-medium cursor-not-allowed">
                    Non, Poids évalué à 1 KG
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Insurance</label>
                  <select 
                    value={dispatchData.do_insurance ? "yes" : "no"} 
                    onChange={e => setDispatchData({...dispatchData, do_insurance: e.target.value === "yes"})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none cursor-pointer"
                  >
                    <option value="yes" className="bg-[#141720]">Yes (0% fee)</option>
                    <option value="no" className="bg-[#141720]">No</option>
                  </select>
                </div>
              </div>

              {dispatchData.do_insurance && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Declared Value</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={dispatchData.declared_value} 
                        onChange={e => setDispatchData({...dispatchData, declared_value: parseInt(e.target.value) || 0})} 
                        className="w-full bg-blue-500/10 border border-blue-500/20 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 text-xs font-bold">DA</span>
                    </div>
                    <p className="text-[10px] text-blue-400 mt-1">Full refund on this value if lost.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping Method</label>
                  <select 
                    value={dispatchData.is_stopdesk ? "stopdesk" : "home"} 
                    onChange={e => setDispatchData({...dispatchData, is_stopdesk: e.target.value === "stopdesk"})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none cursor-pointer"
                  >
                    <option value="home" className="bg-[#141720]">Tarif à domicile</option>
                    <option value="stopdesk" className="bg-[#141720]">Tarif stop-desk</option>
                  </select>
                </div>
              </div>

              {dispatchData.is_stopdesk && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mt-4">
                  <label className="block text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Stop Desk ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 160001"
                    value={dispatchData.stopdesk_id} 
                    onChange={e => setDispatchData({...dispatchData, stopdesk_id: e.target.value})} 
                    className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                  />
                  <p className="text-[10px] text-orange-400 mt-1">Check Yalidine Dashboard for exact Center IDs.</p>
                </div>
              )}

              {/* Autorisation d'ouverture */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">Autorisation d&apos;ouverture</label>
                  <p className="text-[10px] text-gray-500 mt-0.5">Le client peut ouvrir le colis avant paiement.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDispatchData({...dispatchData, autorisation_ouverture: !dispatchData.autorisation_ouverture})}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                    dispatchData.autorisation_ouverture ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    dispatchData.autorisation_ouverture ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setEditingDispatchOrder(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={pushToYalidine}
                disabled={pushingId === editingDispatchOrder.id}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#e11d48] hover:bg-[#be123c] transition-colors flex items-center justify-center min-w-[140px]"
              >
                {pushingId === editingDispatchOrder.id ? "Dispatching..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditingOrder(null)}>
          <div className="bg-[#141720] rounded-t-[1.5rem] md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-4 md:p-6 border border-white/5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base md:text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Edit Order</h3>
              <button onClick={() => setEditingOrder(null)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Wilaya + Commune */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Wilaya</label>
                  <input 
                    type="text" 
                    value={editForm.wilaya} 
                    onChange={e => setEditForm({...editForm, wilaya: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Commune</label>
                  <input 
                    type="text" 
                    value={editForm.commune} 
                    onChange={e => setEditForm({...editForm, commune: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Item + Color + Size */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Product</label>
                  <input 
                    type="text" 
                    value={editForm.item} 
                    onChange={e => setEditForm({...editForm, item: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Color</label>
                  <input 
                    type="text" 
                    value={editForm.color} 
                    onChange={e => setEditForm({...editForm, color: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Size</label>
                  <input 
                    type="text" 
                    value={editForm.size} 
                    onChange={e => setEditForm({...editForm, size: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price + Total */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Price</label>
                  <input 
                    type="text" 
                    value={editForm.price} 
                    onChange={e => setEditForm({...editForm, price: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Total</label>
                  <input 
                    type="text" 
                    value={editForm.total} 
                    onChange={e => setEditForm({...editForm, total: e.target.value})} 
                    className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button 
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveEditOrder}
                disabled={savingEdit}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-[100px]"
              >
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
