"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { siliconeLoofahProduct, customerReviews } from "@/data/siliconeLoofahProducts";
import algeriaData from "@/data/algeria.json";
import { useMetaEvents } from "@/hooks/useMetaEvents";

interface SiliconeLoofahShowcaseProps {
  initialZonePrices: Record<number, number>;
}

export default function SiliconeLoofahShowcase({ initialZonePrices }: SiliconeLoofahShowcaseProps) {
  const [selectedBundle, setSelectedBundle] = useState<1 | 2 | 3>(1); // Default to 1 piece
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Form refs for abandoned lead tracking
  const formNameRef = useRef("");
  const formPhoneRef = useRef("");
  const abandonedLeadSent = useRef(false);
  const orderFormRef = useRef<HTMLDivElement | null>(null);

  const { sendEvent } = useMetaEvents();

  // Pricing calculation
  const getProductPrice = () => {
    if (selectedBundle === 3) return siliconeLoofahProduct.triplePrice;
    if (selectedBundle === 2) return siliconeLoofahProduct.doublePrice;
    return siliconeLoofahProduct.singlePrice;
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

  const deliveryPrice = selectedWilayaObj ? (initialZonePrices[selectedWilayaObj.zone] ?? 700) : 0;
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
        ? "عرض العائلة 3 قطع (8,200 د.ج)"
        : selectedBundle === 2
        ? "عرض القطعتين (6,000 د.ج)"
        : "قطعة واحدة (3,500 د.ج)";

    const payload = JSON.stringify({
      name,
      phone,
      wilaya: selectedWilayaObj
        ? `${selectedWilayaObj.wilaya_id} - ${selectedWilayaObj.wilaya_name_latin}`
        : selectedWilaya || null,
      commune: selectedCommune || null,
      item: siliconeLoofahProduct.arabicName,
      color: "Standard",
      size: bundleText,
      quantity: selectedBundle,
      price: `${productPrice.toLocaleString("fr-DZ")} DA`,
      delivery: deliveryPrice,
      total: selectedWilaya ? `${totalPrice.toLocaleString("fr-DZ")} DA` : null,
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
        ? "عرض العائلة 3 قطع (8200 DA)"
        : selectedBundle === 2
        ? "عرض القطعتين (6000 DA)"
        : "قطعة واحدة (3500 DA)";

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
          item: siliconeLoofahProduct.arabicName,
          color: "Standard",
          size: bundleText,
          quantity: selectedBundle,
          price: `${productPrice.toLocaleString("fr-DZ")} DA`,
          delivery: deliveryPrice,
          total: `${totalPrice.toLocaleString("fr-DZ")} DA`,
        }),
      });

      if (res.ok) {
        setOrderSuccess(true);
        sendEvent("Purchase", {
          currency: "DZD",
          value: totalPrice,
          contentName: siliconeLoofahProduct.arabicName,
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
    <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-sky-500 selection:text-white pb-20">
      {/* Clean Top Announcement Banner */}
      <div className="bg-sky-700 text-white font-bold text-center py-2.5 px-4 text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2">
        <span>🚚 التوصيل متوفر لجميع 58 ولاية — الدفع يد بيد عند الاستلام 💵</span>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6">
        {/* All 5 Uploaded Poster Images Displayed Stacked Seamlessly */}
        <div className="space-y-4">
          {siliconeLoofahProduct.gallery.map((posterUrl, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-2 sm:p-4">
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden">
                <Image
                  src={posterUrl}
                  alt={`عرض بوستر ${i + 1}`}
                  fill
                  priority={i === 0}
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Quick CTA Scroll Button to Form */}
        <div className="text-center">
          <button
            onClick={scrollToCheckout}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>اطلب الآن — الدفع عند الاستلام 🛒</span>
          </button>
        </div>

        {/* Embedded Clean Order Form (استمارة الطلب) */}
        <div ref={orderFormRef} className="scroll-mt-6">
          <div className="bg-white border-2 border-sky-600 rounded-2xl p-4 sm:p-8 shadow-md">
            <div className="text-center mb-5 border-b border-slate-100 pb-3">
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full">
                استمارة الطلب 📝
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2 mb-1">
                أدخل معلوماتك واطلب الآن
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                التوصيل متوفر لـ 58 ولاية. الدفع نقدًا عند استلام المنتج.
              </p>
            </div>

            {!orderSuccess ? (
              <form onSubmit={handleOrderSubmit} className="space-y-4 max-w-xl mx-auto">
                {/* Bundle Options */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">اختر العرض المناسب لك:</label>

                  {/* Option 1: Single Piece (FIRST) */}
                  <button
                    type="button"
                    onClick={() => setSelectedBundle(1)}
                    className={`w-full text-right p-3 rounded-lg border-2 transition-all flex items-center justify-between cursor-pointer ${
                      selectedBundle === 1
                        ? "bg-sky-50 border-sky-600 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">قطعة واحدة (1 قطعة)</div>
                      <div className="text-[11px] text-slate-500">استعمال شخصي</div>
                    </div>
                    <div className="font-black text-sky-700 text-sm">
                      3,500 <span className="text-[10px]">د.ج</span>
                    </div>
                  </button>

                  {/* Option 2: Best Seller (2 Pieces) */}
                  <button
                    type="button"
                    onClick={() => setSelectedBundle(2)}
                    className={`w-full text-right p-3 rounded-lg border-2 transition-all flex items-center justify-between cursor-pointer ${
                      selectedBundle === 2
                        ? "bg-sky-50 border-sky-600 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        عرض القطعتين (2 قطع) <span className="text-xs text-red-600 font-extrabold">(الأكثر طلباً 🔥)</span>
                      </div>
                      <div className="text-[11px] text-sky-700 font-semibold">توفير 1,000 د.ج</div>
                    </div>
                    <div className="font-black text-sky-700 text-sm">
                      6,000 <span className="text-[10px]">د.ج</span>
                    </div>
                  </button>

                  {/* Option 3: Family Pack */}
                  <button
                    type="button"
                    onClick={() => setSelectedBundle(3)}
                    className={`w-full text-right p-3 rounded-lg border-2 transition-all flex items-center justify-between cursor-pointer ${
                      selectedBundle === 3
                        ? "bg-sky-50 border-sky-600 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">عرض العائلة (3 قطع) 🎁</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">توفير 2,300 د.ج</div>
                    </div>
                    <div className="font-black text-sky-700 text-sm">
                      8,200 <span className="text-[10px]">د.ج</span>
                    </div>
                  </button>
                </div>

                {/* Selected Option Summary */}
                <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-xs sm:text-sm flex justify-between items-center">
                  <div>
                    <span className="text-slate-600">العرض المختار: </span>
                    <span className="font-bold text-slate-900">
                      {selectedBundle === 3
                        ? "عرض العائلة 3 قطع"
                        : selectedBundle === 2
                        ? "عرض القطعتين (6,000 د.ج)"
                        : "قطعة واحدة (3,500 د.ج)"}
                    </span>
                  </div>
                  <div className="font-extrabold text-sky-700 text-base">
                    {productPrice.toLocaleString("fr-DZ")} د.ج
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم واللقب <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="أدخل اسمك الكامل"
                    onChange={(e) => (formNameRef.current = e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-sky-600 focus:bg-white rounded-lg px-3.5 py-2.5 text-slate-900 text-sm outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="06XX XX XX XX / 07XX XX XX XX"
                    onChange={(e) => (formPhoneRef.current = e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-sky-600 focus:bg-white rounded-lg px-3.5 py-2.5 text-slate-900 text-sm outline-none text-right"
                  />
                </div>

                {/* Wilaya Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الولاية <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedWilaya}
                    onChange={(e) => {
                      setSelectedWilaya(e.target.value);
                      setSelectedCommune("");
                    }}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-sky-600 focus:bg-white rounded-lg px-3.5 py-2.5 text-slate-900 text-sm outline-none"
                  >
                    <option value="">-- اختر الولاية --</option>
                    {algeriaData.wilayas.map((w: { wilaya_id: string; wilaya_name_latin: string }) => (
                      <option key={w.wilaya_id} value={w.wilaya_id}>
                        {w.wilaya_id} - {w.wilaya_name_latin}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commune Selector */}
                {selectedWilaya && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">البلدية</label>
                    <select
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-sky-600 focus:bg-white rounded-lg px-3.5 py-2.5 text-slate-900 text-sm outline-none"
                    >
                      <option value="">-- اختر البلدية --</option>
                      {communesForWilaya.map((c: { commune_id: number; commune_name_latin: string }) => (
                        <option key={c.commune_id} value={c.commune_name_latin}>
                          {c.commune_name_latin}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="bg-slate-100 p-3.5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>سعر المنتج:</span>
                    <span>{productPrice.toLocaleString("fr-DZ")} د.ج</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>مصاريف التوصيل:</span>
                    <span>{selectedWilaya ? `${deliveryPrice.toLocaleString("fr-DZ")} د.ج` : "حدد الولاية"}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                    <span>المبلغ الإجمالي عند الاستلام:</span>
                    <span className="text-lg text-emerald-700 font-extrabold">
                      {selectedWilaya ? `${totalPrice.toLocaleString("fr-DZ")} د.ج` : `${productPrice.toLocaleString("fr-DZ")} د.ج`}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base sm:text-lg py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>جاري تأكيد الطلب...</span>
                  ) : (
                    <span>تأكيد الطلب الآن (الدفع عند الاستلام) 🛒</span>
                  )}
                </button>
              </form>
            ) : (
              /* Success Screen */
              <div className="text-center py-8 space-y-3 max-w-md mx-auto">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl mx-auto font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900">تم تسجيل طلبك بنجاح! 🎉</h3>
                <p className="text-xs text-slate-600">
                  شكراً لطلبك. سيتصل بك فريق مبيعاتنا عبر الهاتف لتأكيد الشحن والتسليم.
                </p>
                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700">
                  المبلغ الإجمالي: <span className="font-bold">{totalPrice.toLocaleString("fr-DZ")} د.ج</span>
                </div>
                <button
                  onClick={() => setOrderSuccess(false)}
                  className="text-xs text-sky-700 underline font-semibold"
                >
                  طلب آخر
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <h3 className="text-base font-black text-slate-900 mb-3 text-center">آراء وتقييمات الزبائن ⭐️</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customerReviews.map((rev) => (
              <div key={rev.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{rev.name} ({rev.city})</span>
                  <span className="text-amber-500">{"★".repeat(rev.rating)}</span>
                </div>
                <p className="text-slate-600">&quot;{rev.comment}&quot;</p>
                <span className="text-[10px] text-emerald-700 font-semibold block">✓ شراء مؤكد</span>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Trust Footer */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-600 py-3 border-t border-slate-200">
          <div>🚚 توصيل 58 ولاية</div>
          <div>💵 دفع عند الاستلام</div>
          <div>🛡️ ضمان الجودة 100%</div>
        </div>
      </div>

      {/* Floating Bottom Button for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 shadow-lg z-50 flex items-center justify-between px-4 sm:hidden">
        <div>
          <div className="text-[10px] text-slate-500">ليفة السيليكون المزدوجة</div>
          <div className="text-base font-black text-sky-700">
            {productPrice.toLocaleString("fr-DZ")} <span className="text-[10px]">د.ج</span>
          </div>
        </div>
        <button
          onClick={scrollToCheckout}
          className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow cursor-pointer"
        >
          اطلب الآن 🛒
        </button>
      </div>
    </div>
  );
}
