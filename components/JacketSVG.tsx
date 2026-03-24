"use client";

import React from "react";

interface JacketSVGProps {
  fill1: string;
  fill2: string;
  fill3: string;
  size?: "full" | "thumb";
  productType?: "hoodie" | "tee" | "compression";
}

/* ───────── HOODIE ───────── */
const HoodieSVG: React.FC<{ f1: string; f2: string; f3: string }> = ({ f1, f2, f3 }) => (
  <g>
    <defs>
      <linearGradient id={`hb-${f1}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={f1} />
        <stop offset="100%" stopColor={f2} />
      </linearGradient>
      <linearGradient id={`hs-${f1}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={f2} />
        <stop offset="100%" stopColor={f3} />
      </linearGradient>
      <radialGradient id={`hsh-${f1}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="150" cy="345" rx="85" ry="10" fill={`url(#hsh-${f1})`} />
    {/* Left sleeve */}
    <path d="M55 110 C25 125, 10 180, 15 250 C17 268, 35 275, 50 272 L65 262 C60 200, 62 155, 72 120 Z" fill={`url(#hs-${f1})`} />
    <path d="M48 150 C35 158, 28 180, 30 195 L60 185 C62 170, 58 152, 52 145 Z" fill={f2} opacity="0.15" />
    <path d="M38 200 C28 212, 22 235, 24 248 L56 238 C58 222, 52 205, 45 198 Z" fill={f3} opacity="0.12" />
    {/* Right sleeve */}
    <path d="M245 110 C275 125, 290 180, 285 250 C283 268, 265 275, 250 272 L235 262 C240 200, 238 155, 228 120 Z" fill={`url(#hs-${f1})`} />
    <path d="M252 150 C265 158, 272 180, 270 195 L240 185 C238 170, 242 152, 248 145 Z" fill={f2} opacity="0.15" />
    <path d="M262 200 C272 212, 278 235, 276 248 L244 238 C242 222, 248 205, 255 198 Z" fill={f3} opacity="0.12" />
    {/* Body */}
    <path d="M72 105 C68 105, 62 110, 62 118 L58 295 C58 312, 70 322, 88 325 L212 325 C230 322, 242 312, 242 295 L238 118 C238 110, 232 105, 228 105 Z" fill={`url(#hb-${f1})`} />
    {/* Hood */}
    <path d="M72 105 C78 55, 110 30, 150 26 C190 30, 222 55, 228 105 C222 92, 195 78, 150 74 C105 78, 78 92, 72 105 Z" fill={f1} />
    <path d="M85 100 C92 70, 118 52, 150 48 C182 52, 208 70, 215 100 C208 88, 188 76, 150 72 C112 76, 92 88, 85 100 Z" fill={f3} opacity="0.35" />
    {/* Hood drawstrings */}
    <line x1="135" y1="105" x2="130" y2="140" stroke="#333" strokeWidth="1.5" opacity="0.4" />
    <line x1="165" y1="105" x2="170" y2="140" stroke="#333" strokeWidth="1.5" opacity="0.4" />
    <circle cx="130" cy="142" r="2.5" fill="#444" opacity="0.5" />
    <circle cx="170" cy="142" r="2.5" fill="#444" opacity="0.5" />
    {/* Kangaroo pocket */}
    <path d="M95 215 L205 215 C208 215, 210 218, 210 222 L210 265 C210 270, 208 272, 205 272 L95 272 C92 272, 90 270, 90 265 L90 222 C90 218, 92 215, 95 215 Z" fill={f2} opacity="0.25" />
    <path d="M148 215 L148 272" stroke={f3} strokeWidth="1" opacity="0.3" />
    <path d="M152 215 L152 272" stroke={f3} strokeWidth="1" opacity="0.3" />
    {/* Center seam */}
    <line x1="150" y1="105" x2="150" y2="325" stroke={f3} strokeWidth="1" opacity="0.18" />
    {/* Ribbing at bottom */}
    <rect x="62" y="315" width="176" height="10" rx="3" fill={f3} opacity="0.25" />
    {/* Cuff ribbing */}
    <rect x="12" y="248" width="42" height="8" rx="3" fill={f3} opacity="0.2" transform="rotate(-5, 33, 252)" />
    <rect x="246" y="248" width="42" height="8" rx="3" fill={f3} opacity="0.2" transform="rotate(5, 267, 252)" />
    {/* Subtle chest logo */}
    <path d="M140 145 L150 138 L160 145 L150 152 Z" fill="#ffffff" opacity="0.08" />
    {/* Body highlight */}
    <path d="M90 115 C95 112, 130 108, 145 115 L140 240 C125 245, 95 240, 92 235 Z" fill="white" opacity="0.025" />
  </g>
);

/* ───────── OVERSIZED TEE ───────── */
const TeeSVG: React.FC<{ f1: string; f2: string; f3: string }> = ({ f1, f2, f3 }) => (
  <g>
    <defs>
      <linearGradient id={`tb-${f1}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={f1} />
        <stop offset="100%" stopColor={f2} />
      </linearGradient>
      <linearGradient id={`tsl-${f1}`} x1="0" y1="0" x2="1" y2="0.5">
        <stop offset="0%" stopColor={f2} />
        <stop offset="100%" stopColor={f3} />
      </linearGradient>
      <radialGradient id={`tsh-${f1}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="150" cy="340" rx="90" ry="10" fill={`url(#tsh-${f1})`} />
    {/* Left sleeve — dropped shoulder oversized */}
    <path d="M55 100 C20 112, 5 145, 10 185 L50 178 C48 150, 52 125, 65 108 Z" fill={`url(#tsl-${f1})`} />
    <path d="M10 185 L12 190 C15 192, 48 184, 50 178 Z" fill={f3} opacity="0.3" />
    {/* Right sleeve */}
    <path d="M245 100 C280 112, 295 145, 290 185 L250 178 C252 150, 248 125, 235 108 Z" fill={`url(#tsl-${f1})`} />
    <path d="M290 185 L288 190 C285 192, 252 184, 250 178 Z" fill={f3} opacity="0.3" />
    {/* Body — oversized boxy fit */}
    <path d="M65 95 C60 95, 52 100, 50 108 L45 310 C45 325, 58 335, 78 337 L222 337 C242 335, 255 325, 255 310 L250 108 C248 100, 240 95, 235 95 Z" fill={`url(#tb-${f1})`} />
    {/* Neckline - crew neck */}
    <path d="M105 95 C110 82, 130 75, 150 73 C170 75, 190 82, 195 95" fill={f3} stroke={f3} strokeWidth="1" />
    <path d="M108 95 C113 84, 132 78, 150 76 C168 78, 187 84, 192 95" fill={f1} />
    {/* Collar ribbing */}
    <path d="M108 95 C113 84, 132 78, 150 76 C168 78, 187 84, 192 95 C187 87, 168 82, 150 80 C132 82, 113 87, 108 95 Z" fill={f2} opacity="0.5" />
    {/* Bold GYMSHARK back print - simulated as geometric shapes */}
    <text x="150" y="180" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="28" fontWeight="900" fill="white" opacity="0.12" letterSpacing="4">
      GYMSPOTT
    </text>
    {/* Side seams */}
    <line x1="52" y1="115" x2="46" y2="330" stroke={f3} strokeWidth="0.8" opacity="0.15" />
    <line x1="248" y1="115" x2="254" y2="330" stroke={f3} strokeWidth="0.8" opacity="0.15" />
    {/* Bottom hem */}
    <path d="M46 328 Q150 340, 254 328" stroke={f3} strokeWidth="1.5" fill="none" opacity="0.2" />
    {/* Body highlight */}
    <path d="M90 105 C100 100, 140 98, 148 105 L142 260 C130 265, 95 260, 92 255 Z" fill="white" opacity="0.02" />
    {/* Small chest logo */}
    <path d="M138 120 L150 112 L162 120 L150 128 Z" fill="#ffffff" opacity="0.06" />
  </g>
);

/* ───────── COMPRESSION LONG-SLEEVE ───────── */
const CompressionSVG: React.FC<{ f1: string; f2: string; f3: string }> = ({ f1, f2, f3 }) => (
  <g>
    <defs>
      <linearGradient id={`cb-${f1}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={f1} />
        <stop offset="100%" stopColor={f2} />
      </linearGradient>
      <linearGradient id={`cs-${f1}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={f1} />
        <stop offset="100%" stopColor={f3} />
      </linearGradient>
      <radialGradient id={`csh-${f1}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="150" cy="340" rx="70" ry="8" fill={`url(#csh-${f1})`} />
    {/* Left sleeve — long, fitted */}
    <path d="M68 100 C42 110, 28 155, 25 215 C23 250, 26 275, 32 290 L52 288 C48 270, 45 245, 48 215 C50 160, 58 125, 78 108 Z" fill={`url(#cs-${f1})`} />
    {/* Left cuff */}
    <rect x="28" y="282" width="28" height="10" rx="4" fill={f3} opacity="0.35" />
    {/* Right sleeve */}
    <path d="M232 100 C258 110, 272 155, 275 215 C277 250, 274 275, 268 290 L248 288 C252 270, 255 245, 252 215 C250 160, 242 125, 222 108 Z" fill={`url(#cs-${f1})`} />
    {/* Right cuff */}
    <rect x="244" y="282" width="28" height="10" rx="4" fill={f3} opacity="0.35" />
    {/* Body — form-fitting, tapered */}
    <path d="M78 96 C74 96, 68 100, 66 108 L62 305 C62 318, 72 326, 88 328 L212 328 C228 326, 238 318, 238 305 L234 108 C232 100, 226 96, 222 96 Z" fill={`url(#cb-${f1})`} />
    {/* Mock neck / high collar */}
    <path d="M100 96 C105 72, 125 60, 150 58 C175 60, 195 72, 200 96 L195 96 C190 76, 172 67, 150 65 C128 67, 110 76, 105 96 Z" fill={f1} />
    <path d="M105 96 C110 78, 128 70, 150 68 C172 70, 190 78, 195 96 C190 82, 172 75, 150 73 C128 75, 110 82, 105 96 Z" fill={f2} opacity="0.5" />
    {/* Compression panel lines */}
    <path d="M82 130 C100 128, 130 130, 150 130" stroke="white" strokeWidth="0.5" fill="none" opacity="0.06" />
    <path d="M218 130 C200 128, 170 130, 150 130" stroke="white" strokeWidth="0.5" fill="none" opacity="0.06" />
    <path d="M80 180 C110 176, 140 178, 150 178" stroke="white" strokeWidth="0.5" fill="none" opacity="0.05" />
    <path d="M220 180 C190 176, 160 178, 150 178" stroke="white" strokeWidth="0.5" fill="none" opacity="0.05" />
    <path d="M78 230 C108 226, 138 228, 150 228" stroke="white" strokeWidth="0.5" fill="none" opacity="0.04" />
    <path d="M222 230 C192 226, 162 228, 150 228" stroke="white" strokeWidth="0.5" fill="none" opacity="0.04" />
    {/* Center seam */}
    <line x1="150" y1="96" x2="150" y2="328" stroke={f3} strokeWidth="0.8" opacity="0.12" />
    {/* Side panels suggesting compression zones */}
    <path d="M70 120 C72 118, 74 200, 66 300" stroke="white" strokeWidth="0.6" fill="none" opacity="0.04" />
    <path d="M230 120 C228 118, 226 200, 234 300" stroke="white" strokeWidth="0.6" fill="none" opacity="0.04" />
    {/* Small chest logo */}
    <path d="M140 118 L150 110 L160 118 L150 126 Z" fill="#ffffff" opacity="0.07" />
    {/* Subtle sheen / highlight */}
    <path d="M100 105 C108 100, 140 98, 148 105 L142 250 C130 255, 105 250, 102 245 Z" fill="white" opacity="0.02" />
    {/* Bottom hem */}
    <rect x="66" y="320" width="168" height="8" rx="3" fill={f3} opacity="0.2" />
  </g>
);

const JacketSVG: React.FC<JacketSVGProps> = ({
  fill1,
  fill2,
  fill3,
  size = "full",
  productType = "hoodie",
}) => {
  const isThumb = size === "thumb";
  const w = isThumb ? 80 : 280;
  const h = isThumb ? 96 : 340;

  return (
    <svg
      viewBox="0 0 300 360"
      width={w}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {productType === "hoodie" && <HoodieSVG f1={fill1} f2={fill2} f3={fill3} />}
      {productType === "tee" && <TeeSVG f1={fill1} f2={fill2} f3={fill3} />}
      {productType === "compression" && <CompressionSVG f1={fill1} f2={fill2} f3={fill3} />}
    </svg>
  );
};

export default JacketSVG;
