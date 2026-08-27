"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { chargeSeparatorProduct } from "@/data/chargeSeparatorProducts";
import algeriaData from "@/data/algeria.json";
import { useMetaEvents } from "@/hooks/useMetaEvents";

interface ChargeSeparatorShowcaseProps {
  initialZonePrices: Record<number, number>;
}

const CHARGE_PIXEL_ID = "1031581459671396";

export default function ChargeSeparatorShowcase({ initialZonePrices }: ChargeSeparatorShowcaseProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedBundle, setSelectedBundle] = useState<1 | 2 | 3>(1);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Form refs for abandoned lead tracking
  const formNameRef = useRef("");
  const formPhoneRef = useRef("");
  const abandonedLeadSent = useRef(false);
  const orderFormRef = useRef<HTMLDivElement | null>(null);

  const { sendEvent } = useMetaEvents(undefined, CHARGE_PIXEL_ID);

  // Initialize dedicated Meta Pixel 1031581459671396
  useEffect(() => {
    if (typeof window !== "undefined") {
      const fbq = (window as unknown as { fbq?: (action: string, idOrEvent: string, eventName?: string, params?: Record<string, unknown>) => void }).fbq;
      if (fbq) {
        fbq("init", CHARGE_PIXEL_ID);
        fbq("trackSingle", CHARGE_PIXEL_ID, "PageView");
      }
    }
  }, []);

  // Pricing calculation
  const getProductPrice = () => {
    if (selectedBundle === 3) return chargeSeparatorProduct.triplePrice;
    if (selectedBundle === 2) return chargeSeparatorProduct.doublePrice;
    return chargeSeparatorProduct.singlePrice;
  };

  const productPrice = getProductPrice();

  // Wilaya & commune calculation
  const communesForWilaya = selectedWilaya
    ? algeriaData.communes.filter(
        (c: { wilaya_id: string; commune_name_latin: string; commune_id: number }) =>
          c.wilaya_id.toString() === selectedWilaya
      )
    : [];

  const selectedWilayaObj = algeriaData.wilayas.find(
    (w: { wilaya_id: string; wilaya_name_latin: string; zone: number }) =>
      w.wilaya_id.toString() === selectedWilaya
  );

  const deliveryPrice = selectedWilayaObj ? (initialZonePrices[selectedWilayaObj.zone] ?? 700) + 100 : 0;
  const totalPrice = productPrice + deliveryPrice;

  // Abandoned lead tracker
  const sendAbandonedLead = useCallback(() => {
    const name = formNameRef.current;
    const phone = formPhoneRef.current;
    const phoneDigits = phone.replace(/\D/g, "");
    if (!name || phoneDigits.length < 8 || orderSuccess || isSubmitting || abandonedLeadSent.current) return;

    abandonedLeadSent.current = true;
    const bundleText =
      selectedBundle === 3
        ? "عرض العائلة 3 قطع (6,900 د.ج)"
        : selectedBundle === 2
        ? "عرض القطعتين (5,200 د.ج)"
        : "قطعة واحدة (2,900 د.ج)";

    const payload = JSON.stringify({
      name,
      phone,
      wilaya: selectedWilayaObj
        ? `${selectedWilayaObj.wilaya_id} - ${selectedWilayaObj.wilaya_name_latin}`
        : selectedWilaya || null,
      commune: selectedCommune || null,
      item: chargeSeparatorProduct.arabicName,
      color: "Silver Metallic",
      size: bundleText,
      quantity: selectedBundle,
      price: `${productPrice.toLocaleString("en")} DA`,
      delivery: deliveryPrice,
      total: selectedWilaya ? `${totalPrice.toLocaleString("en")} DA` : null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/abandoned-lead", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/abandoned-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [
    selectedWilaya,
    selectedCommune,
    selectedBundle,
    productPrice,
    deliveryPrice,
    totalPrice,
    orderSuccess,
    isSubmitting,
    selectedWilayaObj,
  ]);

  useEffect(() => {
    const handleBeforeUnload = () => sendAbandonedLead();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendAbandonedLead();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sendAbandonedLead]);

  const scrollToCheckout = () => {
    orderFormRef.current?.scrollIntoView({ behavior: "smooth" });
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

    const bundleText =
      selectedBundle === 3
        ? "عرض 3 قطع (6900 DA)"
        : selectedBundle === 2
        ? "عرض القطعتين (5200 DA)"
        : "قطعة واحدة (2900 DA)";

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          wilaya: selectedWilayaObj
            ? `${selectedWilayaObj.wilaya_id} - ${selectedWilayaObj.wilaya_name_latin}`
            : selectedWilaya,
          commune: selectedCommune,
          item: chargeSeparatorProduct.arabicName,
          color: "Silver Metallic",
          size: bundleText,
          quantity: selectedBundle,
          price: `${productPrice.toLocaleString("en")} DA`,
          delivery: deliveryPrice,
          total: `${totalPrice.toLocaleString("en")} DA`,
        }),
      });

      if (res.ok) {
        setOrderSuccess(true);
        sendEvent("Purchase", {
          currency: "DZD",
          value: totalPrice,
          contentName: chargeSeparatorProduct.arabicName,
        });
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      alert("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0b0c10] text-white font-sans selection:bg-blue-600 selection:text-white pb-20">
      {/* Sleek Top Banner (Rova Style) */}
      <header className="w-full py-4 px-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
          <span className="text-xs font-bold text-slate-300 hidden sm:inline-block">Full-Charge Separator</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-semibold">
          <span>🇩🇿 التوصيل لـ 58 ولاية — الدفع عند الاستلام</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Main Product Showcase Box (Sleek Rova Image Card) */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-3 shadow-2xl space-y-3">
          {/* Main Display Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10">
            <Image
              src={chargeSeparatorProduct.gallery[currentImageIndex]}
              alt={chargeSeparatorProduct.name}
              fill
              priority
              className="object-contain p-2"
            />

            {/* Floating Badges */}
            <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg">
              {chargeSeparatorProduct.badgeText}
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl">
              <span className="text-white text-lg font-black">{productPrice.toLocaleString("en")} DA</span>
              <span className="text-white/40 text-xs line-through">4,500 DA</span>
            </div>
          </div>

          {/* Thumbnail Selector */}
          <div className="grid grid-cols-4 gap-2">
            {chargeSeparatorProduct.gallery.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  currentImageIndex === idx ? "border-blue-500 scale-95 shadow-lg" : "border-white/10 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={imgUrl} alt={`صورة ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Title & Short Info */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {chargeSeparatorProduct.arabicName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {chargeSeparatorProduct.subTitle}
          </p>
        </div>

        {/* Quick Features List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <span className="text-blue-400 text-sm">⚡</span>
            <span><strong>فصل تلقائي 100%:</strong> يقطع الكهرباء تماماً فور وصول الشحن إلى 100%.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <span className="text-blue-400 text-sm">💡</span>
            <span><strong>نمطين للشحن:</strong> وضع الضوء الأبيض للهواتف، والأزرق للسماعات والباوربانك.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <span className="text-blue-400 text-sm">🛡️</span>
            <span><strong>حماية البطارية:</strong> يمنع سخونة وانتفاخ وتدهور سعة البطارية طوال الليل.</span>
          </div>
        </div>

        {/* Streamlined Clean Order Form (Rova Principal Style) */}
        <div ref={orderFormRef} className="bg-white/5 border border-blue-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-white">استمارة الطلب السريع 🛒</h2>
            <p className="text-xs text-slate-300">أدخل معلوماتك أدناه وسيتم الشحن إلى ولايتك</p>
          </div>

          {!orderSuccess ? (
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              {/* Bundle Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">اختر الكمية:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBundle(1)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedBundle === 1
                        ? "bg-blue-600/30 border-blue-500 font-bold text-white shadow"
                        : "bg-black/40 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs">1 قطعة</div>
                    <div className="text-sm font-extrabold text-blue-400 mt-0.5">2,900 DA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBundle(2)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                      selectedBundle === 2
                        ? "bg-blue-600/40 border-blue-400 font-bold text-white shadow-lg ring-1 ring-blue-400/50"
                        : "bg-black/40 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs">2 قطع (الأكثر طلباً)</div>
                    <div className="text-sm font-extrabold text-amber-400 mt-0.5">5,200 DA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBundle(3)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedBundle === 3
                        ? "bg-blue-600/30 border-blue-500 font-bold text-white shadow"
                        : "bg-black/40 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs">3 قطع (العائلة)</div>
                    <div className="text-sm font-extrabold text-emerald-400 mt-0.5">6,900 DA</div>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاسم واللقب *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="أدخل اسمك الكامل"
                  onChange={(e) => (formNameRef.current = e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="06XX XX XX XX / 07XX XX XX XX"
                  onChange={(e) => (formPhoneRef.current = e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600 text-left dir-ltr"
                />
              </div>

              {/* Wilaya Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الولاية *</label>
                <select
                  required
                  value={selectedWilaya}
                  onChange={(e) => {
                    setSelectedWilaya(e.target.value);
                    setSelectedCommune("");
                  }}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">اختر الولاية...</option>
                  {algeriaData.wilayas.map((w: { wilaya_id: string; wilaya_name_latin: string }) => (
                    <option key={w.wilaya_id} value={w.wilaya_id}>
                      {w.wilaya_id} - {w.wilaya_name_latin}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commune Selection */}
              {selectedWilaya && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">البلدية *</label>
                  <select
                    required
                    value={selectedCommune}
                    onChange={(e) => setSelectedCommune(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">اختر البلدية...</option>
                    {communesForWilaya.map((c: { commune_id: number; commune_name_latin: string }) => (
                      <option key={c.commune_id} value={c.commune_name_latin}>
                        {c.commune_name_latin}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Total Calculation */}
              <div className="bg-black/60 rounded-xl p-3.5 border border-white/10 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>سعر المنتج:</span>
                  <span className="font-bold text-white">{productPrice.toLocaleString("en")} DA</span>
                </div>
                <div className="flex justify-between">
                  <span>سعر التوصيل:</span>
                  <span className="font-bold text-white">
                    {selectedWilaya ? `${deliveryPrice.toLocaleString("en")} DA` : "حدد الولاية"}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-extrabold text-blue-400">
                  <span>المجموع الإجمالي:</span>
                  <span>{selectedWilaya ? `${totalPrice.toLocaleString("en")} DA` : `${productPrice.toLocaleString("en")} DA + التوصيل`}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-base py-3.5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                {isSubmitting ? <span>جاري تسجيل الطلب... ⏳</span> : <span>تأكيد الطلب الآن 🛒</span>}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="text-4xl">✅</div>
              <h3 className="text-xl font-bold text-white">تم استقبال طلبك بنجاح!</h3>
              <p className="text-xs text-slate-300">
                سيتصل بك فريق خدمة العملاء قريباً لتأكيد طلبك وتجهيز الشحن.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_25px_rgba(0,0,0,0.7)]">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">السعر:</span>
            <span className="text-base sm:text-lg font-black text-blue-400">{productPrice.toLocaleString("en")} DA</span>
          </div>
          <button
            onClick={scrollToCheckout}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-95"
          >
            <span>اطلب الآن — الدفع عند الاستلام 🛒</span>
          </button>
        </div>
      </div>
    </div>
  );
}
