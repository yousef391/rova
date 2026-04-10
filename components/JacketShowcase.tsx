"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jackets } from "@/data/jackets";
import algeriaData from "@/data/algeria.json";
import Image from "next/image";

// Using pure Yalidine data and pre-discounted Delivery Fees!
const JacketShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const animating = useRef(false);

  const jacket = jackets[currentIndex];
  
  const communesForWilaya = selectedWilaya ? algeriaData.communes.filter((c: { wilaya_id: string; commune_name_latin: string; commune_id: number }) => c.wilaya_id.toString() === selectedWilaya) : [];
  const selectedWilayaObj = algeriaData.wilayas.find((w: { wilaya_id: string; wilaya_name_latin: string }) => w.wilaya_id.toString() === selectedWilaya);
  const deliveryPrice = selectedWilayaObj ? selectedWilayaObj.delivery_fee : 0;
  
  const productPrice = parseFloat(jacket.price.replace(/[^\d]/g, ""));
  const totalPrice = productPrice + deliveryPrice;

  const navigate = useCallback((dir: number) => {
    if (animating.current) return;
    animating.current = true;
    setCurrentIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return jackets.length - 1;
      if (next >= jackets.length) return 0;
      return next;
    });
    setTimeout(() => {
      animating.current = false;
    }, 600);
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const wilayaObj = algeriaData.wilayas.find((w: { wilaya_id: string; wilaya_name_latin: string }) => w.wilaya_id.toString() === selectedWilaya);

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          wilaya: wilayaObj ? `${wilayaObj.wilaya_id} - ${wilayaObj.wilaya_name_latin}` : selectedWilaya,
          commune: selectedCommune,
          item: jacket.name,
          color: jacket.colorName,
          size: selectedSize,
          price: jacket.price,
          delivery: deliveryPrice,
          total: `${totalPrice.toLocaleString()} DA`
        })
      });
      
      if (res.ok) {
        setOrderSuccess(true);
        
        // Track the purchase event for Facebook Pixel
        type FBQ = (action: string, event: string, params?: Record<string, unknown>) => void;
        if (typeof window !== "undefined" && (window as unknown as { fbq?: FBQ }).fbq) {
          ((window as unknown as { fbq: FBQ }).fbq)('track', 'Purchase', {
            currency: 'DZD',
            value: totalPrice,
            content_name: jacket.name,
            content_category: jacket.productType,
            content_type: 'product',
          });
        }

        setTimeout(() => {
          setShowForm(false);
          setOrderSuccess(false);
        }, 3000);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTo = useCallback(
    (idx: number) => {
      if (animating.current || idx === currentIndex) return;
      animating.current = true;
      setCurrentIndex(idx);
      setTimeout(() => {
        animating.current = false;
      }, 600);
    },
    [currentIndex]
  );

  const handleAddToCartClick = () => {
    setShowForm(true);
    type FBQ = (action: string, event: string, params?: Record<string, unknown>) => void;
    if (typeof window !== "undefined" && (window as unknown as { fbq?: FBQ }).fbq) {
      ((window as unknown as { fbq: FBQ }).fbq)('track', 'AddToCart', {
        currency: 'DZD',
        value: productPrice,
        content_name: jacket.name,
        content_category: jacket.productType,
        content_type: 'product',
      });
    }
  };

  return (
    <motion.div
      className="relative w-screen min-h-screen lg:min-h-screen overflow-hidden flex flex-col"
      animate={{ backgroundColor: jacket.bg }}
      transition={{ duration: 0.6 }}
    >
      {/* ────── HEADER (Desktop Only) ────── */}
      <header className="hidden lg:flex relative z-30 justify-between items-center px-10 py-8 shrink-0 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo" className="h-20 w-auto object-contain drop-shadow-2xl" />
        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 gap-3 border border-white/20 shadow-xl shadow-black/20">
          <span className="text-2xl leading-none mt-[-2px]">🇩🇿</span>
          <span className="text-white font-black tracking-widest uppercase text-sm" style={{ fontFamily: "var(--font-dm)" }}>
            Livraison 58 Wilayas
          </span>
          <span className="text-2xl leading-none mt-[-2px]">🇩🇿</span>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* ────── MOBILE LAYOUT (ULTRA-PREMIUM) ────── */}
      <div className="flex flex-col lg:hidden flex-1 px-4 pt-3 pb-6 gap-4 overflow-y-auto no-scrollbar">
        
        {/* Mobile Header */}
        <div className="flex items-center justify-center w-full flex-shrink-0 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="h-[4.5rem] w-auto object-contain drop-shadow-xl scale-125" />
        </div>

        {/* Product Image Box with Floating Badges */}
        <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-shrink-0 z-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={jacket.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(e, { offset, velocity }) => {
                const swipePower = Math.abs(offset.x) * velocity.x;
                if (swipePower < -5000 || offset.x < -100) navigate(1);
                else if (swipePower > 5000 || offset.x > 100) navigate(-1);
              }}
              className="relative w-full h-full"
            >
              <Image src={jacket.image} alt={jacket.name} fill className="object-cover pointer-events-none" priority />
            </motion.div>
          </AnimatePresence>
          
          {/* Floating Badges inside Image */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-50">
             <div className="bg-white/90 backdrop-blur-md rounded-full px-2.5 py-1.5 flex items-center gap-1.5 shadow-md">
                <span className="text-[12px] leading-none">🇩🇿</span>
                <span className="text-black font-black tracking-wider uppercase text-[9px]" style={{ fontFamily: "var(--font-dm)" }}>
                  Livraison 58 Wilayas
                </span>
             </div>
             <div className="bg-black/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 w-fit">
                <span className="text-white font-bold tracking-widest uppercase text-[9px]" style={{ fontFamily: "var(--font-dm)" }}>
                  {jacket.tag}
                </span>
             </div>
          </div>
          
          {/* Dots Nav inside image */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-50 pointer-events-none">
             {jackets.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "w-1.5 bg-white/30"}`} />
             ))}
          </div>
        </div>

        {/* Product Info & CTA */}
        <div className="flex flex-col flex-1 justify-between gap-4 mt-1">
           {/* Title and Price */}
           <div className="flex justify-between items-start z-30">
             <div className="flex flex-col">
               <AnimatePresence mode="wait">
                 <motion.h1 
                    key={`m-title-${jacket.id}`}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="text-white text-[1.7rem] sm:text-4xl font-black uppercase leading-[1.05] tracking-tighter w-[180px]" 
                    style={{ fontFamily: "var(--font-heading)" }}
                 >
                   {jacket.name}
                 </motion.h1>
               </AnimatePresence>
               <div className="flex items-center gap-1 mt-1.5">
                 <span className="text-[#fbbf24] text-[11px] tracking-widest">★★★★★</span>
                 <span className="text-white/40 text-[10px] ml-1 font-medium" style={{ fontFamily: "var(--font-dm)" }}>4.8 (120+ avis)</span>
               </div>
             </div>
             
             <AnimatePresence mode="wait">
               <motion.span
                 key={`m-price-${jacket.id}`}
                 initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }}
                 className="text-white text-[1.6rem] font-bold tracking-tight whitespace-nowrap pt-1"
                 style={{ fontFamily: "var(--font-heading)" }}
               >
                 {jacket.price}
               </motion.span>
             </AnimatePresence>
           </div>

           {/* Variants & Buy Now */}
           <AnimatePresence mode="popLayout">
             <div className="flex flex-col gap-3">
                 <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-[1.2rem] p-3.5 shadow-inner backdrop-blur-sm">
                   <span className="text-white/60 text-[11px] uppercase tracking-widest font-bold font-dm">Color: <span className="text-white ml-1 font-black">{jacket.colorName}</span></span>
                   <div className="flex gap-2.5">
                      {jackets.map((j, idx) => (
                         <button key={j.id} type="button" onClick={() => switchTo(idx)} className={`w-7 h-7 rounded-full transition-all duration-300 border-2 ${idx === currentIndex ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent scale-95 opacity-80"}`} style={{ backgroundColor: j.swatch }} />
                      ))}
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-[1.2rem] p-3.5 shadow-inner backdrop-blur-sm">
                   <span className="text-white/60 text-[11px] uppercase tracking-widest font-bold font-dm">Size</span   >
                   <div className="flex gap-2">
                      {["S", "M", "L", "XL"].map((s) => (
                         <button key={s} type="button" onClick={() => setSelectedSize(s)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black transition-all duration-300 ${selectedSize === s ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-white/10 text-white"}`} style={{ fontFamily: "var(--font-dm)" }}>
                           {s}
                         </button>
                      ))}
                   </div>
                 </div>

               <motion.form
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col gap-3 font-sans"
                 style={{ direction: "rtl" }}
                 onSubmit={(e) => {
                   if (typeof window !== "undefined" && (window as any).fbq) {
                     (window as any).fbq('track', 'AddToCart', { currency: 'DZD', value: productPrice, content_name: jacket.name, content_category: jacket.productType, content_type: 'product' });
                   }
                   handleOrderSubmit(e);
                 }}
               >
                 <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-xl border border-white/10 mt-1 shadow-2xl flex flex-col gap-3">
                   <h3 className="text-white font-black uppercase tracking-tight text-lg mb-1 hidden" style={{ fontFamily: "var(--font-heading)" }}>تأكيد الطلبية</h3>
                   <input required name="name" placeholder="الاسم الكامل" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[15px] text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors" />
                   <input required type="tel" name="phone" placeholder="رقم الهاتف" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[15px] text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors text-right" dir="ltr" />
                   <div className="flex flex-col gap-2">
                     <select 
                       required 
                       value={selectedWilaya} 
                       onChange={e => { setSelectedWilaya(e.target.value); setSelectedCommune(""); }}
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[15px] text-white focus:outline-none focus:border-white/40 transition-colors appearance-none"
                     >
                       <option value="" disabled className="text-black">اختر الولاية</option>
                       {algeriaData.wilayas.map((w: { wilaya_id: string; wilaya_name_latin: string }) => (
                         <option key={w.wilaya_id} value={w.wilaya_id} className="text-black text-left" dir="ltr">
                           {w.wilaya_id} - {w.wilaya_name_latin}
                         </option>
                       ))}
                     </select>
                     <select 
                       required 
                       value={selectedCommune} 
                       onChange={e => setSelectedCommune(e.target.value)}
                       disabled={!selectedWilaya}
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[15px] text-white focus:outline-none focus:border-white/40 transition-colors appearance-none disabled:opacity-50"
                     >
                       <option value="" disabled className="text-black">البلدية</option>
                       {communesForWilaya.map((c: { commune_id: number; commune_name_latin: string; wilaya_id: string }) => (
                         <option key={c.commune_id} value={c.commune_name_latin} className="text-black text-left" dir="ltr">
                           {c.commune_name_latin}
                         </option>
                       ))}
                     </select>
                   </div>
                 
                   {/* Order Summary */}
                   <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1 mt-1 font-sans">
                     <div className="flex justify-between text-white/70 text-xs">
                       <span>المجموع (المقاس: {selectedSize})</span>
                       <span dir="ltr">{jacket.price}</span>
                     </div>
                     <div className="flex justify-between text-white/70 text-xs">
                       <span>التوصيل</span>
                       <span className="text-white font-medium" dir="ltr">{selectedWilaya ? `${deliveryPrice} DA` : '---'}</span>
                     </div>
                     <div className="h-[1px] w-full bg-white/10 my-1"/>
                     <div className="flex justify-between text-white text-sm font-bold">
                       <span>السعر النهائي</span>
                       <span dir="ltr">{selectedWilaya ? `${totalPrice.toLocaleString()} DA` : '---'}</span>
                     </div>
                   </div>

                   <button disabled={isSubmitting || orderSuccess} type="submit" className="w-full py-4 mt-2 rounded-[1.2rem] bg-white text-black font-black uppercase text-[15px] tracking-tight shadow-[0_10px_40px_rgba(255,255,255,0.3)] active:scale-[0.98] transition-transform flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75 disabled:scale-100">
                     {isSubmitting ? "جاري الإرسال..." : orderSuccess ? "تم الطلب بنجاح ✓" : "تأكيد الطلب"}
                   </button>
                 </div>
               </motion.form>
             </div>
          </AnimatePresence>
        </div>
      </div>

      {/* ────── DESKTOP LAYOUT ────── */}
      {/* Floating tag */}
      <div className="hidden lg:block absolute top-36 left-10 z-20">
        <AnimatePresence mode="wait">
          <motion.span
            key={jacket.tag + "-d"}
            initial={{ opacity: 0, scale: 0.7, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold tracking-wide backdrop-blur-md border border-white/10 bg-white/5"
            style={{ color: "white", fontFamily: "var(--font-dm)" }}
          >
            {jacket.tag}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Hero text — left */}
      <div className="hidden lg:flex absolute left-10 top-1/2 -translate-y-1/2 z-20 max-w-[380px] flex-col">
        <AnimatePresence mode="wait">
          <motion.h1
            key={`d-name-${jacket.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-white text-5xl xl:text-6xl leading-[1.05] tracking-tighter uppercase font-black mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {jacket.name.split(" ").map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </motion.h1>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={`d-desc-${jacket.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-white/40 text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            {jacket.desc}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Center image — desktop */}
      <div className="hidden lg:flex absolute inset-0 items-center justify-center z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={jacket.id + "-d"}
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative w-[480px] h-[600px] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)] border border-white/10 bg-white/5 pointer-events-auto"
          >
            <Image
              src={jacket.image}
              alt={jacket.name}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Sidebar — Color & Size (Desktop) */}
      <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 z-20 flex-col gap-10 w-[120px] items-end">
        <div className="flex flex-col gap-4 items-end">
          <span className="text-white/60 text-xs uppercase tracking-[0.2em] font-bold" style={{ fontFamily: "var(--font-heading)" }}>Color</span>
          {jackets.map((j, idx) => (
            <motion.button
              key={j.id} onClick={() => switchTo(idx)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${idx === currentIndex ? "border-white scale-110" : "border-transparent scale-100"}`}
              style={{ backgroundColor: j.swatch }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-3 items-end">
          <span className="text-white/60 text-xs uppercase tracking-[0.2em] font-bold" style={{ fontFamily: "var(--font-heading)" }}>Size</span>
          {["S", "M", "L", "XL"].map((s) => (
            <button
              key={s} onClick={() => setSelectedSize(s)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${selectedSize === s ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
              style={{ fontFamily: "var(--font-dm)" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom bar — desktop */}
      <div className="hidden lg:flex absolute bottom-0 left-0 right-0 z-20 items-end justify-between px-10 pb-8">
        {/* Review */}
        <div className="max-w-[280px]">
          <div className="flex items-center gap-1 mb-1.5">
            {[1, 2, 3, 4].map((s) => (
              <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z" />
              </svg>
            ))}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z" />
            </svg>
            <span className="text-white/50 text-xs ml-1" style={{ fontFamily: "var(--font-dm)" }}>4.8</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={`d-rev-${jacket.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-white/35 text-xs italic leading-relaxed"
              style={{ fontFamily: "var(--font-dm)" }}
            >
              {jacket.review}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Price + arrows */}
        <div className="flex flex-col items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.span
              key={`d-price-${jacket.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="text-white text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {jacket.price}
            </motion.span>
          </AnimatePresence>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M10 3L5 8L10 13" /></svg>
            </motion.button>
            <span className="text-white/50 text-xs tabular-nums" style={{ fontFamily: "var(--font-dm)" }}>{currentIndex + 1} / {jackets.length}</span>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate(1)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M6 3L11 8L6 13" /></svg>
            </motion.button>
          </div>
        </div>

        {/* Buy Now vs Form (Desktop) */}
        <div className="relative">
          <AnimatePresence mode="wait">
              <motion.form
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute bottom-0 right-0 w-[400px] flex flex-col gap-3 bg-white/10 p-6 rounded-[2rem] backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
                style={{ fontFamily: "var(--font-dm)", direction: "rtl" }}
                onSubmit={(e) => {
                   if (typeof window !== "undefined" && (window as any).fbq) {
                     (window as any).fbq('track', 'AddToCart', { currency: 'DZD', value: productPrice, content_name: jacket.name, content_category: jacket.productType, content_type: 'product' });
                   }
                   handleOrderSubmit(e);
                 }}
              >
                {/* Glow behind form */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-[-1]" />
                
                <h3 className="text-white font-black tracking-tight text-2xl mb-1 relative z-10" style={{ fontFamily: "var(--font-heading)" }}>تأكيد الطلبية</h3>
                <input required name="name" placeholder="الاسم الكامل" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-colors text-base relative z-10" />
                <input required type="tel" name="phone" placeholder="رقم الهاتف" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-colors text-right text-base relative z-10" dir="ltr" />
                <div className="flex gap-2 relative z-10">
                  <select 
                    required 
                    value={selectedWilaya} 
                    onChange={e => { setSelectedWilaya(e.target.value); setSelectedCommune(""); }}
                    className="w-[45%] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer text-base"
                  >
                    <option value="" disabled className="text-black">1. الولاية</option>
                    {algeriaData.wilayas.map((w: { wilaya_id: string; wilaya_name_latin: string }) => (
                      <option key={w.wilaya_id} value={w.wilaya_id} className="text-black text-left" dir="ltr">
                        {w.wilaya_id} - {w.wilaya_name_latin}
                      </option>
                    ))}
                  </select>
                  <select 
                    required 
                    value={selectedCommune} 
                    onChange={e => setSelectedCommune(e.target.value)}
                    disabled={!selectedWilaya}
                    className="w-[55%] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors appearance-none disabled:opacity-50 cursor-pointer text-base"
                  >
                    <option value="" disabled className="text-black">2. البلدية</option>
                    {communesForWilaya.map((c: { commune_id: number; commune_name_latin: string; wilaya_id: string }) => (
                      <option key={c.commune_id} value={c.commune_name_latin} className="text-black text-left" dir="ltr">
                        {c.commune_name_latin}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Summary */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 mt-1 font-sans relative z-10">
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>المجموع (المقاس: {selectedSize})</span>
                    <span dir="ltr">{jacket.price}</span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>التوصيل</span>
                    <span className="text-white font-medium" dir="ltr">{selectedWilaya ? `${deliveryPrice} DA` : '---'}</span>
                  </div>
                  <div className="h-[1px] w-full bg-white/10 my-1"/>
                  <div className="flex justify-between text-white text-lg font-black">
                    <span>السعر النهائي</span>
                    <span dir="ltr">{selectedWilaya ? `${totalPrice.toLocaleString()} DA` : '---'}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-3 font-sans relative z-10 w-full" dir="ltr">
                  <button disabled={isSubmitting || orderSuccess} type="submit" className="w-full py-4 rounded-xl bg-white text-black font-black uppercase text-sm tracking-wider hover:bg-white/90 transition-transform active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer disabled:opacity-75 disabled:scale-100 flex items-center justify-center">
                    {isSubmitting ? "جاري الإرسال..." : orderSuccess ? "تم الطلب بنجاح ✓" : "تأكيد الطلب"}
                  </button>
                </div>
              </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default JacketShowcase;
