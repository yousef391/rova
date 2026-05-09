"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Package, X, MapPin, Phone, Calendar, Truck, ChevronRight } from "lucide-react";

/* ──────────────────────────── Types ──────────────────────────── */

type Parcel = {
  tracking: string;
  order_id: string;
  firstname: string;
  familyname: string;
  contact_phone: string;
  address: string;
  is_stopdesk: number;
  stopdesk_id: number | null;
  stopdesk_name: string | null;
  from_wilaya_name: string;
  to_commune_name: string;
  to_wilaya_name: string;
  product_list: string;
  price: number;
  delivery_fee: number;
  freeshipping: number;
  date_creation: string;
  date_expedition: string | null;
  date_last_status: string;
  last_status: string;
  current_center_name: string | null;
  current_wilaya_name: string | null;
  current_commune_name: string | null;
  payment_status: string;
  label: string;
};

type HistoryEvent = {
  date_status: string;
  tracking: string;
  status: string;
  reason: string;
  center_name?: string;
  wilaya_name?: string;
  commune_name?: string;
};

type ParcelsResponse = {
  has_more: boolean;
  total_data: number;
  data: Parcel[];
  links: { self: string; next: string | null };
};

/* ──────────────────────────── Helpers ─────────────────────────── */

const statusColor = (s: string) => {
  const l = s.toLowerCase();
  if (l.includes("livré")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (l.includes("expédié") || l.includes("vers wilaya") || l.includes("en transit") || l.includes("sorti")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (l.includes("centre") || l.includes("prêt") || l.includes("reçu")) return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
  if (l.includes("préparation") || l.includes("ramass") || l.includes("passation")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (l.includes("retour") || l.includes("échoué") || l.includes("echèc") || l.includes("annulé") || l.includes("bloqué")) return "bg-red-500/20 text-red-400 border-red-500/30";
  if (l.includes("alerte") || l.includes("attente")) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return "bg-gray-500/20 text-gray-400 border-gray-500/30";
};

const paymentBadge = (s: string) => {
  if (s === "payed") return "bg-emerald-500/20 text-emerald-400";
  if (s === "ready" || s === "receivable") return "bg-blue-500/20 text-blue-400";
  return "bg-gray-500/20 text-gray-500";
};

const fmtDate = (d: string) => {
  const [date, time] = d.split(" ");
  return { date, time };
};

/* ──────────────────────────── Component ──────────────────────── */

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [searchTracking, setSearchTracking] = useState("");

  // History modal
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ─── Fetch parcels ─── */
  const fetchParcels = async (page = 1, tracking?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("order_by", "date_creation");
      params.set("desc", "");
      if (tracking) params.set("tracking", tracking);

      const res = await fetch(`/api/yalidine/parcels?${params}`);
      const data: ParcelsResponse = await res.json();

      if (!res.ok) throw new Error((data as any).error || "Fetch failed");

      setParcels(data.data || []);
      setTotalData(data.total_data || 0);
      setHasMore(data.has_more || false);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching parcels:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Debounced search ─── */
  useEffect(() => {
    const t = setTimeout(() => {
      fetchParcels(1, searchTracking || undefined);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTracking]);

  /* ─── Open history modal ─── */
  const openHistory = async (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setLoadingHistory(true);
    setHistoryEvents([]);
    try {
      const res = await fetch(`/api/yalidine/histories?tracking=${parcel.tracking}&page_size=100`);
      const data = await res.json();
      setHistoryEvents(data.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeHistory = () => {
    setSelectedParcel(null);
    setHistoryEvents([]);
  };

  /* ──────────────────────────── Render ───────────────────────── */
  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-full max-w-7xl mx-auto" style={{ fontFamily: "var(--font-dm)" }}>

      {/* ═══ HEADER ═══ */}
      <div className="bg-[#141720] p-5 lg:p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
              <Package className="w-6 h-6 text-blue-500" />
              Suivi des Colis
              <span className="bg-blue-500/10 text-blue-400 text-xs py-1 px-3 rounded-full font-medium">
                {totalData} colis
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tous vos colis Yalidine triés par date de création. Cliquez sur un colis pour voir son historique complet.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Tracking ID…"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchTracking(e.target.value);
                }}
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TABLE ═══ */}
      <div className="bg-[#141720] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-56 gap-3">
            <div className="w-6 h-6 border-2 border-blue-900 border-t-blue-400 rounded-full animate-spin" />
            <span className="text-gray-600 text-xs">Chargement…</span>
          </div>
        ) : parcels.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-56 text-gray-600 gap-2">
            <Filter className="w-10 h-10 text-gray-700" />
            <p className="text-sm">Aucun colis trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold w-36">Date Création</th>
                  <th className="py-3.5 px-4 font-semibold">Tracking</th>
                  <th className="py-3.5 px-4 font-semibold">Client</th>
                  <th className="py-3.5 px-4 font-semibold">Destination</th>
                  <th className="py-3.5 px-4 font-semibold">Produit</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Montant</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Statut</th>
                </tr>
              </thead>

              <tbody>
                {parcels.map((p) => {
                  const created = fmtDate(p.date_creation);
                  return (
                    <tr
                      key={p.tracking}
                      onClick={() => openHistory(p)}
                      className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-gray-300">{created.date}</div>
                        <div className="text-[10px] text-gray-600">{created.time}</div>
                      </td>

                      {/* Tracking + Order */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {p.tracking}
                        </span>
                        {p.order_id && (
                          <div className="text-[10px] text-gray-500 mt-1 truncate max-w-[140px]">
                            #{p.order_id}
                          </div>
                        )}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="text-sm text-gray-200 font-medium truncate max-w-[150px]">
                          {p.firstname} {p.familyname}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{p.contact_phone}</div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4">
                        <div className="text-sm text-gray-300 font-medium">{p.to_wilaya_name}</div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">{p.to_commune_name}</span>
                          {p.is_stopdesk ? (
                            <span className="text-[9px] bg-purple-500/20 text-purple-400 font-semibold px-1.5 py-0.5 rounded">SD</span>
                          ) : (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-semibold px-1.5 py-0.5 rounded">DOM</span>
                          )}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-gray-400 truncate max-w-[140px]" title={p.product_list}>
                          {p.product_list || "—"}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="text-sm font-bold text-white">{p.price.toLocaleString()} DA</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">
                          Livr. {p.delivery_fee} DA
                          {p.freeshipping ? <span className="text-emerald-500 ml-1">Free</span> : null}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border inline-block whitespace-nowrap ${statusColor(p.last_status)}`}>
                          {p.last_status}
                        </span>
                        <div className={`text-[9px] mt-1 ${paymentBadge(p.payment_status)} px-1.5 py-0.5 rounded inline-block`}>
                          {p.payment_status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && parcels.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-xs text-gray-600">
              Page {currentPage} — {totalData} colis au total
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <button
                  onClick={() => fetchParcels(currentPage - 1, searchTracking || undefined)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ← Précédent
                </button>
              )}
              {hasMore && (
                <button
                  onClick={() => fetchParcels(currentPage + 1, searchTracking || undefined)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                >
                  Suivant →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ HISTORY MODAL ═══ */}
      {selectedParcel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeHistory(); }}
        >
          <div className="bg-[#141720] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-white/10">

            {/* Modal Header — Parcel summary */}
            <div className="p-5 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <Truck className="w-5 h-5 text-blue-500" />
                    <span className="font-mono text-blue-400">{selectedParcel.tracking}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{selectedParcel.product_list}</p>
                </div>
                <button onClick={closeHistory} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Parcel detail cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase font-semibold mb-1">
                    <MapPin className="w-3 h-3" /> Destination
                  </div>
                  <div className="text-sm text-gray-200 font-medium">{selectedParcel.to_wilaya_name}</div>
                  <div className="text-[11px] text-gray-400">{selectedParcel.to_commune_name}</div>
                  {selectedParcel.is_stopdesk && selectedParcel.stopdesk_name && (
                    <div className="text-[10px] text-purple-400 mt-0.5">{selectedParcel.stopdesk_name}</div>
                  )}
                </div>

                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase font-semibold mb-1">
                    <Phone className="w-3 h-3" /> Client
                  </div>
                  <div className="text-sm text-gray-200 font-medium">{selectedParcel.firstname} {selectedParcel.familyname}</div>
                  <div className="text-[11px] text-gray-400 font-mono">{selectedParcel.contact_phone}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase font-semibold mb-1">
                    <Calendar className="w-3 h-3" /> Dates
                  </div>
                  <div className="text-[11px] text-gray-300">Créé: {selectedParcel.date_creation}</div>
                  <div className="text-[11px] text-gray-400">M.À.J: {selectedParcel.date_last_status}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-gray-500 text-[10px] uppercase font-semibold mb-1">Montant</div>
                  <div className="text-lg font-bold text-white">{selectedParcel.price.toLocaleString()} <span className="text-xs text-gray-400">DA</span></div>
                  <div className="text-[10px] text-gray-500">Livraison: {selectedParcel.delivery_fee} DA</div>
                </div>
              </div>

              {/* Current location */}
              {selectedParcel.current_center_name && (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400 bg-white/5 px-3 py-2 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Position actuelle: <span className="text-gray-200 font-medium">{selectedParcel.current_center_name}</span>
                  {selectedParcel.current_commune_name && <span>— {selectedParcel.current_commune_name}, {selectedParcel.current_wilaya_name}</span>}
                </div>
              )}
            </div>

            {/* Modal Body — Timeline */}
            <div className="p-5 overflow-y-auto flex-1">
              <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">Historique des événements</h4>

              {loadingHistory ? (
                <div className="flex justify-center items-center h-40">
                  <div className="w-6 h-6 border-2 border-blue-900 border-t-blue-400 rounded-full animate-spin" />
                </div>
              ) : historyEvents.length === 0 ? (
                <div className="text-center text-gray-600 py-10 text-sm">Aucun historique trouvé.</div>
              ) : (
                <div className="relative border-l-2 border-white/10 ml-3 pl-6 space-y-6">
                  {historyEvents.map((ev, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-[#141720] ${i === 0 ? "bg-blue-400" : "bg-gray-700"}`} />

                      <div className="bg-white/[0.03] border border-white/5 p-3.5 rounded-xl">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${statusColor(ev.status)}`}>
                            {ev.status}
                          </span>
                          <span className="text-[11px] text-gray-500 whitespace-nowrap">{ev.date_status}</span>
                        </div>

                        {(ev.wilaya_name || ev.commune_name || ev.center_name) && (
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-600" />
                            {[ev.center_name, ev.commune_name, ev.wilaya_name].filter(Boolean).join(", ")}
                          </div>
                        )}

                        {ev.reason && (
                          <div className="mt-2 text-xs text-red-300 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                            <span className="font-bold text-[10px] uppercase text-red-400">Raison:</span> {ev.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
