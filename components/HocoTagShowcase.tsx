"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { hocoProducts, customerReviews, faqs, HocoProduct } from "@/data/hocoProducts";
import algeriaData from "@/data/algeria.json";
import { useMetaEvents } from "@/hooks/useMetaEvents";

interface HocoTagShowcaseProps {
  initialZonePrices: Record<number, number>;
}

const AIRTAG_PIXEL_ID = "1035134782774910";

export default function HocoTagShowcase({ initialZonePrices }: HocoTagShowcaseProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState<1 | 2>(1);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Timer countdown state (starts at 3h 45m 12s)
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 45, seconds: 12 });

  // Form refs for abandoned cart tracking
  const formNameRef = useRef("");
  const formPhoneRef = useRef("");
  const abandonedLeadSent = useRef(false);
  const orderFormRef = useRef<HTMLDivElement | null>(null);

  // Dedicated Meta Pixel tracking for HOCO E101 AirTag product
  const { sendEvent } = useMetaEvents(undefined, AIRTAG_PIXEL_ID);

  const product: HocoProduct = hocoProducts[0];
  const galleryImages = product.gallery || [product.image];
  const productPrice = selectedQuantity === 2 ? 6000 : 3200;

  // Initialize product specific Meta Pixel 1035134782774910
  useEffect(() => {
    if (typeof window !== "undefined") {
      const fbq = (window as unknown as { fbq?: (action: string, idOrEvent: string, eventName?: string, params?: Record<string, unknown>) => void }).fbq;
      if (fbq) {
        fbq("init", AIRTAG_PIXEL_ID);
        fbq("trackSingle", AIRTAG_PIXEL_ID, "PageView");
      }
    }
  }, []);

  // Countdown timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Wilaya and delivery calculation
  const communesForWilaya = selectedWilaya 
    ? algeriaData.communes.filter((c: { wilaya_id: string; commune_name_latin: string; commune_id: number }) => c.wilaya_id.toString() === selectedWilaya) 
    : [];

  const selectedWilayaObj = algeriaData.wilayas.find(
    (w: { wilaya_id: string; wilaya_name_latin: string; wilaya_name_arabic?: string; zone: number }) => w.wilaya_id.toString() === selectedWilaya
  );

  const deliveryPrice = selectedWilayaObj ? (initialZonePrices[selectedWilayaObj.zone] ?? 700) : 0;
  const totalPrice = productPrice + deliveryPrice;

  // Abandoned lead tracker
  const sendAbandonedLead = useCallback(() => {
    const name = formNameRef.current;
    const phone = formPhoneRef.current;
    const phoneDigits = phone.replace(/\D/g, '');
    if (!name || phoneDigits.length < 8 || orderSuccess || isSubmitting || abandonedLeadSent.current) return;
    
    abandonedLeadSent.current = true;
    const payload = JSON.stringify({
      name, 
      phone,
      wilaya: selectedWilayaObj ? `${selectedWilayaObj.wilaya_id} - ${selectedWilayaObj.wilaya_name_latin}` : selectedWilaya || null,
      commune: selectedCommune || null,
      item: product.name,
      color: product.colorName,
      size: selectedQuantity === 2 ? 'Pack of 2 (6000 DA)' : 'Single Item (3200 DA)',
      quantity: selectedQuantity,
      price: `${productPrice.toLocaleString('en')} DA`,
      delivery: deliveryPrice,
      total: selectedWilaya ? `${totalPrice.toLocaleString('en')} DA` : null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/abandoned-lead', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/abandoned-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
    }
  }, [selectedWilaya, selectedCommune, selectedQuantity, productPrice, deliveryPrice, totalPrice, product, orderSuccess, isSubmitting, selectedWilayaObj]);

  useEffect(() => {
    const handleBeforeUnload = () => sendAbandonedLead();
    const handleVisibilityChange = () => { if (document.visibilityState === 'hidden') sendAbandonedLead(); };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { 
      window.removeEventListener('beforeunload', handleBeforeUnload); 
      document.removeEventListener('visibilitychange', handleVisibilityChange); 
    };
  }, [sendAbandonedLead]);

  const scrollToOrderForm = () => {
    orderFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedWilaya) {
      alert("الرجاء اختيار الولاية لتحديد سعر التوصيل");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          wilaya: selectedWilayaObj ? `${selectedWilayaObj.wilaya_id} - ${selectedWilayaObj.wilaya_name_latin}` : selectedWilaya,
          commune: selectedCommune,
          item: product.name,
          color: product.colorName,
          size: selectedQuantity === 2 ? 'عرض القطعتين 2 Pieces (6000 DA)' : 'قطعة واحدة 1 Piece (3200 DA)',
          quantity: selectedQuantity,
          price: `${productPrice.toLocaleString('en')} DA`,
          delivery: deliveryPrice,
          total: `${totalPrice.toLocaleString('en')} DA`
        })
      });

      if (res.ok) {
        setOrderSuccess(true);
        sendEvent('Purchase', {
          value: totalPrice,
          currency: 'DZD',
          contentIds: [product.id],
          contentName: product.name,
          contentCategory: 'Smart Finder',
          contentType: 'product',
        }, { phone, firstName: name });
      } else {
        const data = await res.json();
        alert(data.error || "عذراً، حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في الاتصال. يرجى التأكد من الأنترنت.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#060606] text-white font-sans antialiased selection:bg-blue-600 selection:text-white pb-16">
      
      {/* Dynamic Top Countdown Announcement Banner */}
      <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-900/90 border-b border-blue-800/40 text-xs font-semibold py-2.5 px-4 text-center text-blue-100 flex items-center justify-center gap-3 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <span className="flex items-center gap-1.5 text-blue-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          عرض خاص لفترة محدودة
        </span>
        <div className="flex items-center gap-1 dir-ltr font-mono font-bold text-white bg-black/40 px-2.5 py-0.5 rounded-full text-[11px] border border-blue-500/30">
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
        <span className="hidden md:inline text-zinc-300">• توصيل سريع لـ 58 ولاية والدفع عند الاستلام</span>
      </div>

      {/* Main Container */}
      <div className="max-w-md md:max-w-4xl mx-auto px-4 py-4 md:py-8">
        
        {/* Clean Header */}
        <header className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-blue-500/20">
              H
            </div>
            <div>
              <span className="text-lg font-black tracking-widest text-white block leading-none">HOCO E101</span>
              <span className="text-[9px] text-blue-400 font-medium">Smart Anti-Lost Finder</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              متوفر بالمخزون
            </span>
          </div>
        </header>

        {/* Product Title */}
        <div className="mb-5">
          <h1 className="text-xl md:text-3xl font-extrabold text-white leading-tight">
            جهاز التتبع الذكي الأصلي HOCO E101
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1.5 leading-relaxed">
            {product.subTitle}
          </p>
        </div>

        {/* Interactive Gallery & Main Showcase */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#121215] to-[#0a0a0c] border border-zinc-800/80 p-4 mb-6 overflow-hidden shadow-2xl">
          {/* Main Featured Image Container */}
          <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-xl overflow-hidden group">
            <Image
              src={galleryImages[selectedImageIndex]}
              alt={product.name}
              fill
              priority
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Gallery Thumbnail Selector */}
          <div className="flex items-center justify-center gap-2.5 mt-4 pt-3 border-t border-zinc-800/60">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImageIndex === idx
                    ? "border-blue-500 shadow-md shadow-blue-500/30 scale-105"
                    : "border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-700"
                }`}
              >
                <Image src={img} alt={`عرض المصغرة ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Clean 2-Option Quantity Selection (Single vs 2-Pack) */}
        <div className="mb-6">
          <label className="text-xs font-bold text-zinc-200 block mb-2">
            اختر العرض المناسب لك:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedQuantity(1)}
              className={`p-3.5 rounded-2xl border text-right transition-all relative ${
                selectedQuantity === 1
                  ? 'bg-gradient-to-b from-white to-zinc-200 text-black border-white font-bold shadow-lg shadow-white/10 scale-[1.01]'
                  : 'bg-[#121215] border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className={`text-xs font-bold ${selectedQuantity === 1 ? 'text-black' : 'text-white'}`}>قطعة واحدة</div>
              <div className={`text-base font-black ${selectedQuantity === 1 ? 'text-black' : 'text-white'} mt-1`}>3,200 دج</div>
              <div className={`text-[10px] ${selectedQuantity === 1 ? 'text-zinc-600' : 'text-zinc-500'} mt-0.5 line-through`}>4,800 دج</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedQuantity(2)}
              className={`p-3.5 rounded-2xl border text-right transition-all relative overflow-hidden ${
                selectedQuantity === 2
                  ? 'bg-gradient-to-b from-blue-600 to-indigo-700 text-white border-blue-400 font-bold shadow-lg shadow-blue-600/30 scale-[1.01]'
                  : 'bg-[#121215] border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <span className={`absolute top-0 left-0 ${selectedQuantity === 2 ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white'} text-[9px] px-2 py-0.5 font-black rounded-br-lg shadow`}>
                ⭐ الأكثر مبيعاً
              </span>
              <div className="text-xs font-bold mt-2">عرض قطعتين (2 Pieces)</div>
              <div className="text-base font-black mt-0.5">6,000 دج</div>
              <div className="text-[10px] opacity-80 mt-0.5 flex items-center gap-1">
                <span>توفير 400 دج</span>
                <span className="line-through opacity-60">6,400 دج</span>
              </div>
            </button>
          </div>
        </div>

        {/* Direct Order Form Section */}
        <div ref={orderFormRef} id="order-form" className="bg-[#101014] border border-blue-900/40 rounded-2xl p-4 md:p-6 mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="border-b border-zinc-800/80 pb-3.5 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📋</span>
                <span>إستمارة الطلب السريع</span>
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">الدفع عند الاستلام بعد معاينة المنتج وتأكده</p>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-full font-bold">
              توصيل مضمون
            </span>
          </div>

          {orderSuccess ? (
            <div className="bg-gradient-to-b from-emerald-950/80 to-zinc-900 border border-emerald-700/60 rounded-xl p-6 text-center text-zinc-200 my-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-3">
                ✓
              </div>
              <h3 className="text-lg font-bold text-white mb-1">تم إرسال طلبك بنجاح!</h3>
              <p className="text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">
                شكراً لك <span className="font-bold text-white">{formNameRef.current}</span>. سيتصل بك موظف خدمة العملاء للتأكيد والتوصيل لعنوانك.
              </p>
            </div>
          ) : (
            <form onSubmit={handleOrderSubmit} className="space-y-3.5">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  الاسم واللقب <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="أدخل اسمك الكامل"
                  onChange={(e) => { formNameRef.current = e.target.value; }}
                  className="w-full bg-[#09090b] border border-zinc-800 focus:border-blue-500 rounded-xl px-3.5 py-3 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  رقم الهاتف <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="06XX XX XX XX"
                  onChange={(e) => { formPhoneRef.current = e.target.value; }}
                  className="w-full bg-[#09090b] border border-zinc-800 focus:border-blue-500 rounded-xl px-3.5 py-3 text-white text-xs text-right focus:outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              {/* Wilaya & Commune */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    الولاية <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedWilaya}
                    onChange={(e) => {
                      setSelectedWilaya(e.target.value);
                      setSelectedCommune("");
                    }}
                    required
                    className="w-full bg-[#09090b] border border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-3 text-white text-xs focus:outline-none transition-all"
                  >
                    <option value="">اختر الولاية...</option>
                    {algeriaData.wilayas.map((w: { wilaya_id: string; wilaya_name_latin: string }) => (
                      <option key={w.wilaya_id} value={w.wilaya_id}>
                        {w.wilaya_id} - {w.wilaya_name_latin}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    البلدية <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedCommune}
                    onChange={(e) => setSelectedCommune(e.target.value)}
                    disabled={!selectedWilaya}
                    required
                    className="w-full bg-[#09090b] border border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-3 text-white text-xs focus:outline-none disabled:opacity-40 transition-all"
                  >
                    <option value="">اختر البلدية...</option>
                    {communesForWilaya.map((c: { commune_id: number; commune_name_latin: string }) => (
                      <option key={c.commune_id} value={c.commune_name_latin}>
                        {c.commune_name_latin}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className="bg-[#09090b] border border-zinc-800/80 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>سعر المنتج ({selectedQuantity === 2 ? 'عرض القطعتين' : 'قطعة واحدة'}):</span>
                  <span className="font-bold text-white">{productPrice.toLocaleString('en')} دج</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>تكلفة التوصيل:</span>
                  <span className="font-bold text-white">
                    {selectedWilaya ? `${deliveryPrice.toLocaleString('en')} دج` : 'اختر الولاية لتحديد السعر'}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 flex justify-between font-bold text-white text-sm">
                  <span>المجموع الإجمالي:</span>
                  <span className="text-blue-400 font-black text-base">{totalPrice.toLocaleString('en')} دج</span>
                </div>
              </div>

              {/* Order Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.99] text-white font-black text-sm py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "جاري تسجيل طلبك..." : "تأكيد الطلب الآن (الدفع عند الاستلام)"}</span>
                <span className="text-base">🛍️</span>
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-center text-[10px] text-zinc-400">
                <div className="flex flex-col items-center gap-1">
                  <span>🚚 توصيل 58 ولاية</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span>🤝 معاينة قبل الدفع</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span>🔄 ضمان 30 يوماً</span>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* Key Highlight Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-6">
          <div className="bg-[#101014] border border-zinc-800/80 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">📍</div>
            <div className="text-xs font-bold text-white">تتبع عالمي مباشر</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">عبر تطبيق الخريطة</div>
          </div>
          <div className="bg-[#101014] border border-zinc-800/80 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">🏍️</div>
            <div className="text-xs font-bold text-white">حماية من السرقة</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">للموتور والسيارة</div>
          </div>
          <div className="bg-[#101014] border border-zinc-800/80 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">🔊</div>
            <div className="text-xs font-bold text-white">رنين صوتي قوي</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">لإيجاد المفاتيح فوراً</div>
          </div>
          <div className="bg-[#101014] border border-zinc-800/80 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">🔋</div>
            <div className="text-xs font-bold text-white">بطارية تدوم سنة كاملة</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-bold">1 عام (1 Year)</div>
          </div>
          <div className="bg-[#101014] border border-zinc-800/80 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <div className="text-xl mb-1">⚡</div>
            <div className="text-xs font-bold text-white">بدون اشتراك شهري</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">بدون شريحة SIM</div>
          </div>
        </div>

        {/* Feature Infographic Banners */}
        <div className="space-y-4 mb-10">
          
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden bg-[#101014] shadow-sm">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/products/hoco_mob_antitheft.png"
                alt="تتبع مباشر لحماية الدراجة والسيارة من السرقة"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden bg-[#101014] shadow-sm">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/products/hoco_mob_sound.png"
                alt="صوت رنين مرتفع للبحث عن المفاتيح والشنط"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden bg-[#101014] shadow-sm">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/products/hoco_mob_nosub.png"
                alt="بدون شريحة SIM وبدون اشتراك شهري"
                fill
                className="object-cover"
              />
            </div>
          </div>

        </div>

        {/* Verified Customer Reviews Section */}
        <div className="mb-10 border-t border-zinc-800/80 pt-6">
          <div className="text-center mb-5">
            <h2 className="text-base font-bold text-white">آراء وتقييمات العملاء</h2>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <div className="flex text-amber-400 text-xs">★★★★★</div>
              <span className="text-xs font-bold text-zinc-300">4.9 / 5.0</span>
              <span className="text-[10px] text-zinc-500">(أكثر من 280+ تقييم إيجابي)</span>
            </div>
          </div>

          <div className="space-y-3">
            {customerReviews.map((rev, i) => (
              <div key={i} className="bg-[#101014] border border-zinc-800/80 rounded-xl p-3.5 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{rev.name}</span>
                    <span className="text-[10px] text-zinc-500">• {rev.city}</span>
                  </div>
                  <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded font-bold">
                    ✓ مشتري مؤكد
                  </span>
                </div>
                <div className="text-amber-400 text-[10px] mb-1">★★★★★</div>
                <p className="text-zinc-300 leading-relaxed">&quot;{rev.comment}&quot;</p>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="mb-10">
          <h2 className="text-base font-bold text-white text-center mb-4">الأسئلة الشائعة</h2>
          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#101014] border border-zinc-800/80 rounded-xl overflow-hidden text-xs">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-right p-3.5 font-semibold text-white flex justify-between items-center"
                >
                  <span>{faq.q}</span>
                  <span className="text-blue-400 font-black text-sm">{activeFaq === idx ? '−' : '+'}</span>
                </button>
                {activeFaq === idx && (
                  <div className="p-3.5 pt-0 text-zinc-400 border-t border-zinc-800/60 leading-relaxed bg-[#08080a]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clean Footer */}
        <footer className="py-6 border-t border-zinc-800/80 text-center text-[11px] text-zinc-500 pb-16">
          <p>© 2026 جميع الحقوق محفوظة. توصيل لـ 58 ولاية • الدفع عند الاستلام</p>
        </footer>

      </div>

      {/* Floating Mobile Order CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#08080b]/95 border-t border-zinc-800/90 p-3 z-40 backdrop-blur-md flex items-center justify-between">
        <div>
          <div className="text-[10px] text-zinc-400">HOCO E101 Smart Tag</div>
          <div className="text-xs font-black text-white">{productPrice.toLocaleString('en')} دج</div>
        </div>
        <button
          onClick={scrollToOrderForm}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          أطلب الآن (الدفع عند الاستلام)
        </button>
      </div>

    </div>
  );
}
