"use client";

import { Save, Shield, Webhook, Link2, DollarSign, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [fbPixelId, setFbPixelId] = useState("");
  
  // Yalidine
  const [yalidineApiId, setYalidineApiId] = useState("");
  const [yalidineApiToken, setYalidineApiToken] = useState("");

  // Pricing
  const [singlePrice, setSinglePrice] = useState(5400);
  const [bundlePrice, setBundlePrice] = useState(8200);

  // Zone delivery pricing
  const [zone0, setZone0] = useState(590);
  const [zone1, setZone1] = useState(700);
  const [zone2, setZone2] = useState(900);
  const [zone3, setZone3] = useState(950);
  const [zone4, setZone4] = useState(1050);
  const [zone5, setZone5] = useState(1600);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single();
        if (data) {
          setTelegramToken(data.telegram_bot_token || "");
          setTelegramChatId(data.telegram_chat_id || "");
          setFbPixelId(data.fb_pixel_id || "");
          setYalidineApiId(data.yalidine_api_id || "");
          setYalidineApiToken(data.yalidine_api_token || "");
          setSinglePrice(data.single_price ?? 5400);
          setBundlePrice(data.bundle_price ?? 8200);
          setZone0(data.zone_0_price ?? 590);
          setZone1(data.zone_1_price ?? 700);
          setZone2(data.zone_2_price ?? 900);
          setZone3(data.zone_3_price ?? 950);
          setZone4(data.zone_4_price ?? 1050);
          setZone5(data.zone_5_price ?? 1600);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          telegram_bot_token: telegramToken,
          telegram_chat_id: telegramChatId,
          fb_pixel_id: fbPixelId,
          yalidine_api_id: yalidineApiId,
          yalidine_api_token: yalidineApiToken,
          single_price: singlePrice,
          bundle_price: bundlePrice,
          zone_0_price: zone0,
          zone_1_price: zone1,
          zone_2_price: zone2,
          zone_3_price: zone3,
          zone_4_price: zone4,
          zone_5_price: zone5
        })
        .eq('id', 1);

      if (error) throw error;
      
      // Tell Next.js to purge the edge cache so the storefront updates instantly
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/' })
      });

      alert("Settings saved! The website has been updated instantly.");
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto" style={{ fontFamily: "var(--font-dm)" }}>
      
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>System Settings</h2>
        <p className="text-gray-500 mt-1">Manage your integrations, API keys, and environment variables securely from the database.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* Telegram Integration Card */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#2AABEE]"></div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#2AABEE]/10 rounded-xl flex items-center justify-center text-[#2AABEE]">
                <Webhook size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Telegram Notifications</h3>
                <p className="text-gray-500 text-sm">Configure where new orders are sent.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Bot Token</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="Enter Bot Token"
                    className="w-full bg-[#F4F7FE] border-none rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
                <span className="text-xs text-gray-400">Provided by @BotFather.</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Chat ID</label>
                <div className="relative">
                  <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="-100123456789"
                    className="w-full bg-[#F4F7FE] border-none rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
                <span className="text-xs text-gray-400">The channel or user ID where orders go.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Facebook Pixel Card */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#1877F2]"></div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1877F2]/10 rounded-xl flex items-center justify-center text-[#1877F2]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Facebook Pixel</h3>
                <p className="text-gray-500 text-sm">Track conversions, Add to Cart, and Purchases.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Pixel ID (Database value)</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={fbPixelId}
                    onChange={(e) => setFbPixelId(e.target.value)}
                    placeholder="Enter Pixel ID"
                    className="w-full bg-[#F4F7FE] border-none rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
                <span className="text-xs text-gray-400">Dynamically used across all customer-facing pages.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Yalidine Delivery API Card */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#e11d48]"></div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#e11d48]/10 rounded-xl flex items-center justify-center text-[#e11d48]">
                <Webhook size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Yalidine Delivery</h3>
                <p className="text-gray-500 text-sm">Automatically dispatch your orders into the Yalidine network.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">API ID</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={yalidineApiId}
                    onChange={(e) => setYalidineApiId(e.target.value)}
                    placeholder="Enter Yalidine API ID"
                    className="w-full bg-[#F4F7FE] border-none rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
                <span className="text-xs text-gray-400">Found in your Yalidine Developer Dashboard.</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">API Token</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={yalidineApiToken}
                    onChange={(e) => setYalidineApiToken(e.target.value)}
                    placeholder="Enter Yalidine API Token"
                    className="w-full bg-[#F4F7FE] border-none rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
                <span className="text-xs text-gray-400">Keep this token secure!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Pricing Card */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Product Pricing</h3>
                <p className="text-gray-500 text-sm">Set the prices displayed on the storefront. Changes apply instantly after save.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Single Piece Price</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number" 
                    value={singlePrice}
                    onChange={(e) => setSinglePrice(parseInt(e.target.value) || 0)}
                    placeholder="5400"
                    className="w-full bg-[#F4F7FE] border-none rounded-xl pl-11 pr-16 py-3 text-gray-900 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">DA</span>
                </div>
                <span className="text-xs text-gray-400">Price for 1 piece ("1 قطعة").</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Bundle Price (2 Pieces)</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number" 
                    value={bundlePrice}
                    onChange={(e) => setBundlePrice(parseInt(e.target.value) || 0)}
                    placeholder="8200"
                    className="w-full bg-[#F4F7FE] border-none rounded-xl pl-11 pr-16 py-3 text-gray-900 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">DA</span>
                </div>
                <span className="text-xs text-gray-400">Promo price for 2 pieces ("2 قطع"). Savings: <strong className="text-emerald-600">{((singlePrice * 2) - bundlePrice).toLocaleString()} DA</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Zone Pricing Card */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>Delivery Pricing by Zone</h3>
                <p className="text-gray-500 text-sm">Set delivery fees per zone. Each wilaya is assigned to a zone.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Zone 0 — Oran', value: zone0, set: setZone0, color: 'emerald' },
                { label: 'Zone 1 — Alger, SBA, Mosta, Mascara, A.T.', value: zone1, set: setZone1, color: 'blue' },
                { label: 'Zone 2 — Nord / Hauts Plateaux', value: zone2, set: setZone2, color: 'indigo' },
                { label: 'Zone 3 — Sud proche', value: zone3, set: setZone3, color: 'amber' },
                { label: 'Zone 4 — Sud lointain', value: zone4, set: setZone4, color: 'orange' },
                { label: 'Zone 5 — Grand Sud', value: zone5, set: setZone5, color: 'red' },
              ].map((z) => (
                <div key={z.label} className="flex flex-col gap-1.5 bg-[#F4F7FE] rounded-xl p-4">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">{z.label}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={z.value}
                      onChange={(e) => z.set(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-12 py-2 text-gray-900 text-sm font-mono font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">DA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-75 shadow-lg shadow-blue-600/30"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              <>
                <Save size={18} />
                Save Changes to DB
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

