"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { hocoProducts, customerReviews, faqs, HocoProduct } from "@/data/hocoProducts";
import algeriaData from "@/data/algeria.json";
import { useMetaEvents } from "@/hooks/useMetaEvents";

interface HocoTagShowcaseProps {
  initialZonePrices: Record<number, number>;
}

export default function HocoTagShowcase({ initialZonePrices }: HocoTagShowcaseProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<1 | 2>(1);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Form refs for abandoned cart tracking
  const formNameRef = useRef("");
  const formPhoneRef = useRef("");
  const abandonedLeadSent = useRef(false);
  const orderFormRef = useRef<HTMLDivElement | null>(null);

  const { sendEvent } = useMetaEvents();

  const product: HocoProduct = hocoProducts[0];
  const productPrice = selectedQuantity === 2 ? 6000 : 3200;

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
    <div dir="rtl" className="min-h-screen bg-[#080808] text-white font-sans antialiased selection:bg-white selection:text-black">
      
      {/* Top Announcement Bar */}
      <div className="bg-[#121212] border-b border-zinc-800 text-[11px] md:text-xs font-medium py-2.5 px-4 text-center text-zinc-300">
        توصيل لـ 58 ولاية • الدفع عند الاستلام بعد المعاينة
      </div>

      {/* Main Container */}
      <div className="max-w-md md:max-w-4xl mx-auto px-4 py-4 md:py-8">
        
        {/* Clean Header */}
        <header className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-widest text-white">HOCO E101</span>
            <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">الأصلي</span>
          </div>
          <span className="text-xs text-white bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full font-medium">
            متوفر بالمخزون
          </span>
        </header>

        {/* Product Title */}
        <div className="mb-4">
          <h1 className="text-lg md:text-2xl font-bold text-white leading-tight">
            جهاز التتبع الذكي HOCO E101
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {product.subTitle}
          </p>
        </div>

        {/* Clipped Real Product Image Card */}
        <div className="relative rounded-2xl bg-[#121212] border border-zinc-800 p-4 mb-5 overflow-hidden shadow-sm">
          <div className="relative w-full aspect-square max-w-[300px] mx-auto rounded-xl overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Clean 2-Option Quantity Selection (Single vs 2-Pack) */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
            اختر العرض:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedQuantity(1)}
              className={`p-3 rounded-xl border text-right transition-all ${
                selectedQuantity === 1
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className={`text-xs font-bold ${selectedQuantity === 1 ? 'text-black' : 'text-white'}`}>قطعة واحدة</div>
              <div className={`text-sm font-extrabold ${selectedQuantity === 1 ? 'text-black' : 'text-white'} mt-0.5`}>3,200 دج</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedQuantity(2)}
              className={`p-3 rounded-xl border text-right transition-all relative ${
                selectedQuantity === 2
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <span className={`absolute top-1 left-2 text-[9px] ${selectedQuantity === 2 ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'} px-1.5 py-0.5 rounded font-bold`}>
                توفير 400 دج
              </span>
              <div className={`text-xs font-bold ${selectedQuantity === 2 ? 'text-black' : 'text-white'}`}>عرض قطعتين</div>
              <div className={`text-sm font-extrabold ${selectedQuantity === 2 ? 'text-black' : 'text-white'} mt-0.5`}>6,000 دج</div>
            </button>
          </div>
        </div>

        {/* Direct Order Form */}
        <div ref={orderFormRef} id="order-form" className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 md:p-6 mb-10 shadow-lg">
          
          <div className="border-b border-zinc-800 pb-3 mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              استمارة الطلب السريع
            </h2>
            <span className="text-[10px] text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded font-medium">
              الدفع عند الاستلام
            </span>
          </div>

          {orderSuccess ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center text-zinc-200 my-2">
              <h3 className="text-base font-bold text-white mb-1">تم إرسال طلبك بنجاح</h3>
              <p className="text-xs text-zinc-400">
                شكراً لك {formNameRef.current}. سيتصل بك فريق التوصيل لتأكيد التسليم.
              </p>
            </div>
          ) : (
            <form onSubmit={handleOrderSubmit} className="space-y-3">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  الاسم واللقب
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="أدخل اسمك الكامل"
                  onChange={(e) => { formNameRef.current = e.target.value; }}
                  className="w-full bg-[#080808] border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="06XX XX XX XX"
                  onChange={(e) => { formPhoneRef.current = e.target.value; }}
                  className="w-full bg-[#080808] border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-xs text-right focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              {/* Wilaya & Commune */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    الولاية
                  </label>
                  <select
                    value={selectedWilaya}
                    onChange={(e) => {
                      setSelectedWilaya(e.target.value);
                      setSelectedCommune("");
                    }}
                    required
                    className="w-full bg-[#080808] border border-zinc-800 rounded-xl px-2.5 py-2.5 text-white text-xs focus:outline-none focus:border-zinc-500 transition-colors"
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
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    البلدية
                  </label>
                  <select
                    value={selectedCommune}
                    onChange={(e) => setSelectedCommune(e.target.value)}
                    disabled={!selectedWilaya}
                    required
                    className="w-full bg-[#080808] border border-zinc-800 rounded-xl px-2.5 py-2.5 text-white text-xs focus:outline-none focus:border-zinc-500 disabled:opacity-40 transition-colors"
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

              {/* Price Summary */}
              <div className="bg-[#080808] border border-zinc-800 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>سعر المنتج ({selectedQuantity === 2 ? 'قطعتين' : 'قطعة واحدة'}):</span>
                  <span className="font-bold text-white">{productPrice.toLocaleString('en')} دج</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>سعر التوصيل:</span>
                  <span className="font-bold text-white">
                    {selectedWilaya ? `${deliveryPrice.toLocaleString('en')} دج` : 'اختر الولاية'}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-zinc-800 flex justify-between font-bold text-white text-sm">
                  <span>المجموع النهائي:</span>
                  <span className="text-white font-extrabold">{totalPrice.toLocaleString('en')} دج</span>
                </div>
              </div>

              {/* Pure White CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-zinc-200 active:scale-[0.99] text-black font-extrabold text-sm py-3.5 rounded-xl shadow transition-all disabled:opacity-50"
              >
                {isSubmitting ? "جاري الإرسال..." : "تأكيد الطلب الآن (الدفع عند الاستلام)"}
              </button>

              <p className="text-[10px] text-center text-zinc-400 pt-0.5">
                معاينة المنتج والتأكد منه قبل دفع أي مبلغ
              </p>

            </form>
          )}

        </div>

        {/* Clipped Mobile Product Feature Banners */}
        <div className="space-y-4 mb-10">
          
          <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-[#121212] shadow-sm">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/products/hoco_mob_antitheft.png"
                alt="تتبع مباشر لحماية الدراجة والسيارة من السرقة"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-[#121212] shadow-sm">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/products/hoco_mob_sound.png"
                alt="صوت رنين مرتفع للبحث عن المفاتيح والشنط"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-[#121212] shadow-sm">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/products/hoco_mob_nosub.png"
                alt="بدون شريحة SIM وبدون اشتراك شهري"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-[#121212] shadow-sm">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/products/hoco_mob_compat.png"
                alt="متوافق مع أجهزة آيفون وأندرويد"
                fill
                className="object-cover"
              />
            </div>
          </div>

        </div>

        {/* Customer Reviews */}
        <div className="mb-10 border-t border-zinc-800 pt-6">
          <h2 className="text-sm font-bold text-white text-center mb-4">آراء العملاء</h2>
          <div className="space-y-2.5">
            {customerReviews.map((rev, i) => (
              <div key={i} className="bg-[#121212] border border-zinc-800 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between mb-1 text-zinc-300">
                  <span className="font-bold text-white">{rev.name} - {rev.city}</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">&quot;{rev.comment}&quot;</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-white text-center mb-4">الأسئلة الشائعة</h2>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#121212] border border-zinc-800 rounded-xl overflow-hidden text-xs">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-right p-3 font-medium text-white flex justify-between items-center"
                >
                  <span>{faq.q}</span>
                  <span className="text-zinc-400 font-bold">{activeFaq === idx ? '−' : '+'}</span>
                </button>
                {activeFaq === idx && (
                  <div className="p-3 pt-0 text-zinc-400 border-t border-zinc-800 leading-relaxed bg-[#080808]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clean Footer (Removed store branding at bottom as requested) */}
        <footer className="py-6 border-t border-zinc-800 text-center text-[11px] text-zinc-500 pb-16">
          <p>© 2026 جميع الحقوق محفوظة. توصيل لـ 58 ولاية • الدفع عند الاستلام</p>
        </footer>

      </div>

      {/* Floating Mobile Order CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080808]/95 border-t border-zinc-800 p-2.5 z-40 backdrop-blur-md flex items-center justify-between">
        <div>
          <div className="text-[10px] text-zinc-400">HOCO E101 Smart Tag</div>
          <div className="text-xs font-bold text-white">{productPrice.toLocaleString('en')} دج</div>
        </div>
        <button
          onClick={scrollToOrderForm}
          className="bg-white text-black font-extrabold text-xs px-4 py-2 rounded-lg"
        >
          أطلب الآن (الدفع عند الاستلام)
        </button>
      </div>

    </div>
  );
}
