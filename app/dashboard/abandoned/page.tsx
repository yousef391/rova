"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Phone, Copy, Check, X, UserX, RefreshCw, MessageCircle, Tag } from 'lucide-react';

type Lead = {
  id: string;
  name: string;
  phone: string;
  wilaya: string | null;
  commune: string | null;
  item: string | null;
  color: string | null;
  size: string | null;
  quantity: number;
  original_price: string | null;
  delivery: number | null;
  original_total: string | null;
  reduced_price: string | null;
  reduced_total: string | null;
  status: string;
  contacted: boolean;
  contact_notes: string | null;
  converted: boolean;
  created_at: string;
  contacted_at: string | null;
};

const STATUS_OPTIONS = ['new', 'contacted', 'interested', 'not_interested', 'converted', 'expired'];

const getStatusStyle = (s: string) => {
  switch (s) {
    case 'new': return 'bg-blue-500/20 text-blue-400';
    case 'contacted': return 'bg-amber-500/20 text-amber-400';
    case 'interested': return 'bg-purple-500/20 text-purple-400';
    case 'not_interested': return 'bg-gray-500/20 text-gray-400';
    case 'converted': return 'bg-emerald-500/20 text-emerald-400';
    case 'expired': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

export default function AbandonedLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [reducedPrice, setReducedPrice] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/abandoned-leads');
      const data = await res.json();
      if (res.ok) {
        setLeads(data || []);
      } else {
        console.error("Error fetching abandoned leads", data.error);
      }
    } catch (err) {
      console.error("Error fetching abandoned leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1500);
  };

  const updateStatus = async (id: string, status: string) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
    const { error } = await supabase.from('abandoned_leads').update({ status, contacted: status !== 'new', contacted_at: status !== 'new' ? new Date().toISOString() : null }).eq('id', id);
    if (error) {
      console.error("Failed to update status", error);
      fetchLeads();
    }
  };

  const openReduceModal = (lead: Lead) => {
    setEditingLead(lead);
    const origNum = parseInt((lead.original_price || '0').replace(/[^\d]/g, ''), 10);
    setReducedPrice(String(Math.max(0, origNum - 500)));
    setContactNotes(lead.contact_notes || '');
  };

  const saveReducedPrice = async () => {
    if (!editingLead) return;
    setSaving(true);
    const rp = parseInt(reducedPrice, 10) || 0;
    const delivery = editingLead.delivery || 0;
    const reducedTotal = `${(rp + delivery).toLocaleString('en')} DA`;

    await supabase.from('abandoned_leads').update({
      reduced_price: `${rp.toLocaleString('en')} DA`,
      reduced_total: reducedTotal,
      contact_notes: contactNotes,
      status: 'contacted',
      contacted: true,
      contacted_at: new Date().toISOString(),
    }).eq('id', editingLead.id);

    setLeads(leads.map(l => l.id === editingLead.id ? {
      ...l, reduced_price: `${rp.toLocaleString('en')} DA`, reduced_total: reducedTotal,
      contact_notes: contactNotes, status: 'contacted', contacted: true
    } : l));
    setEditingLead(null);
    setSaving(false);
  };

  const convertToOrder = async (lead: Lead) => {
    if (!confirm(`Convert ${lead.name} to a real order?`)) return;
    const price = lead.reduced_price || lead.original_price || '0';
    const total = lead.reduced_total || lead.original_total || '0';

    const { data, error } = await supabase.from('orders').insert([{
      name: lead.name, phone: lead.phone, wilaya: lead.wilaya, commune: lead.commune,
      item: lead.item, color: lead.color, size: lead.size, quantity: lead.quantity,
      price, delivery: lead.delivery, total, status: 'confirmed'
    }]).select('id').single();

    if (!error && data) {
      await supabase.from('abandoned_leads').update({
        converted: true, status: 'converted', converted_order_id: data.id
      }).eq('id', lead.id);
      setLeads(leads.map(l => l.id === lead.id ? { ...l, converted: true, status: 'converted' } : l));
      alert('Lead converted to order successfully!');
    } else {
      alert('Failed to convert lead.');
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await supabase.from('abandoned_leads').delete().eq('id', id);
    setLeads(leads.filter(l => l.id !== id));
  };

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: leads.length,
    newCount: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.contacted).length,
    converted: leads.filter(l => l.converted).length,
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-full max-w-7xl mx-auto pb-10" style={{ fontFamily: "var(--font-dm)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg lg:text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            <UserX className="inline mr-2 mb-1" size={22} /> Leads Abandonnés
          </h2>
          <p className="text-gray-500 text-xs lg:text-sm mt-1">Clients qui ont rempli leurs infos sans acheter</p>
        </div>
        <button onClick={fetchLeads} className="bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
          <RefreshCw size={14} /> {loading ? "..." : "Refresh"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', value: stats.total, bg: 'bg-blue-500/15', text: 'text-blue-400', icon: UserX },
          { label: 'Nouveaux', value: stats.newCount, bg: 'bg-amber-500/15', text: 'text-amber-400', icon: Tag },
          { label: 'Contactés', value: stats.contacted, bg: 'bg-purple-500/15', text: 'text-purple-400', icon: MessageCircle },
          { label: 'Convertis', value: stats.converted, bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: Check },
        ].map(s => (
          <div key={s.label} className="bg-[#141720] rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-[100px]">
            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center ${s.text}`}>
              <s.icon size={16} />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-medium">{s.label}</p>
              <h3 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-heading)" }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input type="text" placeholder="Rechercher par nom ou téléphone..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#141720] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#141720] border border-white/5 rounded-lg px-3 py-2 text-xs font-bold text-gray-300 outline-none appearance-none cursor-pointer uppercase">
          <option value="all">Tous</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Desktop pill filters */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl w-fit">
        <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>All</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors uppercase whitespace-nowrap ${statusFilter === s ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="bg-[#141720] rounded-xl lg:rounded-2xl p-2 lg:p-5 border border-white/5">
        {loading ? (
          <div className="flex justify-center items-center h-48"><div className="w-6 h-6 border-3 border-blue-900 border-t-blue-400 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 text-gray-600 gap-2">
            <UserX className="w-10 h-10 text-gray-700" />
            <p className="text-sm">Aucun lead trouvé.</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-2">
              {filtered.map(lead => (
                <div key={lead.id} className="rounded-xl border border-white/[0.05] p-3 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{lead.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusStyle(lead.status)}`}>{lead.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => copyPhone(lead.phone)} className="flex items-center gap-1">
                      <Phone size={12} className="text-gray-600" />
                      <span className="text-xs text-blue-400 font-mono">{lead.phone}</span>
                      {copiedPhone === lead.phone ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className="text-gray-600" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-500 mb-2">
                    {lead.wilaya && <span>{lead.wilaya}</span>}{lead.item && <span> · {lead.item}</span>}{lead.size && <span> · {lead.size}</span>}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs">
                      <span className="text-gray-500">Prix vu: </span>
                      <span className="text-white font-bold">{lead.original_total || '---'}</span>
                    </div>
                    {lead.reduced_total && (
                      <div className="text-xs">
                        <span className="text-emerald-400 font-bold">→ {lead.reduced_total}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                      className={`flex-1 appearance-none outline-none cursor-pointer px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded text-center ${getStatusStyle(lead.status)}`}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#141720] text-gray-200">{s.replace('_', ' ')}</option>)}
                    </select>
                    <button onClick={() => openReduceModal(lead)} className="bg-amber-500/15 text-amber-400 text-[10px] font-bold px-2 py-1.5 rounded whitespace-nowrap">Réduire</button>
                    {!lead.converted && <button onClick={() => convertToOrder(lead)} className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-1.5 rounded whitespace-nowrap">Convertir</button>}
                    <button onClick={() => deleteLead(lead.id)} className="bg-white/5 hover:bg-red-500/20 text-gray-600 hover:text-red-400 p-1.5 rounded transition-colors"><X size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-sm">
                    <th className="font-medium py-4 px-4">Date</th>
                    <th className="font-medium py-4 px-4">Client</th>
                    <th className="font-medium py-4 px-4">Location</th>
                    <th className="font-medium py-4 px-4">Article</th>
                    <th className="font-medium py-4 px-4 text-right">Prix Original</th>
                    <th className="font-medium py-4 px-4 text-right">Prix Réduit</th>
                    <th className="font-medium py-4 px-4 text-center">Status</th>
                    <th className="font-medium py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(lead => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-4 text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-white">{lead.name}</div>
                        <button onClick={() => copyPhone(lead.phone)} className="flex items-center gap-1.5 mt-1 group/p">
                          <span className="text-xs text-blue-400 font-mono">{lead.phone}</span>
                          {copiedPhone === lead.phone ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-gray-600 group-hover/p:text-blue-400" />}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-300">{lead.wilaya || '---'}</div>
                        <div className="text-xs text-gray-500 mt-1">{lead.commune || ''}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-bold text-gray-200">{lead.item || '---'}</div>
                        <div className="text-xs text-gray-500 mt-1">{lead.color || ''}{lead.size ? ` • ${lead.size}` : ''}</div>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-white text-right">{lead.original_total || '---'}</td>
                      <td className="py-4 px-4 text-sm font-bold text-right">
                        {lead.reduced_total ? <span className="text-emerald-400">{lead.reduced_total}</span> : <span className="text-gray-600">---</span>}
                      </td>
                      <td className="py-4 px-4">
                        <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                          className={`w-full appearance-none outline-none cursor-pointer px-3 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg text-center ${getStatusStyle(lead.status)}`}>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#141720] text-gray-200">{s.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openReduceModal(lead)} title="Réduire le prix"
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 p-2 rounded-lg transition-colors"><Tag size={16} /></button>
                          {!lead.converted && (
                            <button onClick={() => convertToOrder(lead)} title="Convertir en commande"
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-2 rounded-lg transition-colors"><Check size={16} /></button>
                          )}
                          <button onClick={() => deleteLead(lead.id)} title="Supprimer"
                            className="bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 p-2 rounded-lg transition-colors"><X size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Reduce Price Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#141720] rounded-t-[1.5rem] md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-5 md:p-8 border border-white/5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>💰 Réduire le Prix</h3>
              <button onClick={() => setEditingLead(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400"><X size={20} /></button>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Client</span>
                <span className="text-white font-bold">{editingLead.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Téléphone</span>
                <span className="text-blue-400 font-mono">{editingLead.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Prix original</span>
                <span className="text-white font-bold">{editingLead.original_total || '---'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Nouveau Prix Produit (DA)</label>
                <input type="number" value={reducedPrice} onChange={e => setReducedPrice(e.target.value)}
                  className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" />
                {reducedPrice && editingLead.delivery != null && (
                  <p className="text-xs text-gray-500 mt-1">
                    Nouveau total: <span className="text-emerald-400 font-bold">{(parseInt(reducedPrice, 10) + editingLead.delivery).toLocaleString('en')} DA</span>
                    {' '}(livraison: {editingLead.delivery} DA)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes de contact</label>
                <textarea value={contactNotes} onChange={e => setContactNotes(e.target.value)} rows={3} placeholder="Ex: Client intéressé mais trouve le prix élevé..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <button onClick={saveReducedPrice} disabled={saving}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Enregistrer le prix réduit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
