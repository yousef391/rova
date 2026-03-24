"use client";

import React from "react";

interface ThumbSVGProps {
  fill1: string;
  fill2: string;
  fill3: string;
  productType?: "hoodie" | "tee" | "compression";
}

const ThumbHoodie: React.FC<{ f1: string; f2: string; f3: string }> = ({ f1, f2 }) => (
  <g>
    <defs>
      <linearGradient id={`thb-${f1}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={f1} /><stop offset="100%" stopColor={f2} />
      </linearGradient>
    </defs>
    <path d="M55 110 C25 125, 10 180, 15 250 L50 245 C52 180, 58 140, 72 115 Z" fill={f2} />
    <path d="M245 110 C275 125, 290 180, 285 250 L250 245 C248 180, 242 140, 228 115 Z" fill={f2} />
    <path d="M72 105 L62 295 C62 315, 72 322, 88 325 L212 325 C228 322, 238 315, 238 295 L228 105 Z" fill={`url(#thb-${f1})`} />
    <path d="M72 105 C78 55, 110 30, 150 26 C190 30, 222 55, 228 105 C222 92, 195 78, 150 74 C105 78, 78 92, 72 105 Z" fill={f1} />
    <path d="M95 215 L205 215 L205 270 L95 270 Z" fill={f2} opacity="0.2" />
  </g>
);

const ThumbTee: React.FC<{ f1: string; f2: string; f3: string }> = ({ f1, f2, f3 }) => (
  <g>
    <defs>
      <linearGradient id={`ttb-${f1}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={f1} /><stop offset="100%" stopColor={f2} />
      </linearGradient>
    </defs>
    <path d="M55 100 C20 112, 5 145, 10 185 L50 178 C48 150, 52 125, 65 108 Z" fill={f2} />
    <path d="M245 100 C280 112, 295 145, 290 185 L250 178 C252 150, 248 125, 235 108 Z" fill={f2} />
    <path d="M65 95 L45 310 C45 325, 58 335, 78 337 L222 337 C242 335, 255 325, 255 310 L235 95 Z" fill={`url(#ttb-${f1})`} />
    <path d="M108 95 C113 84, 132 78, 150 76 C168 78, 187 84, 192 95" fill={f3} />
    <text x="150" y="185" textAnchor="middle" fontFamily="Arial Black" fontSize="24" fontWeight="900" fill="white" opacity="0.1">GS</text>
  </g>
);

const ThumbCompression: React.FC<{ f1: string; f2: string; f3: string }> = ({ f1, f2 }) => (
  <g>
    <defs>
      <linearGradient id={`tcb-${f1}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={f1} /><stop offset="100%" stopColor={f2} />
      </linearGradient>
    </defs>
    <path d="M68 100 C42 110, 28 155, 25 215 C23 250, 26 275, 32 290 L52 288 C48 250, 50 160, 78 108 Z" fill={f2} />
    <path d="M232 100 C258 110, 272 155, 275 215 C277 250, 274 275, 268 290 L248 288 C252 250, 250 160, 222 108 Z" fill={f2} />
    <path d="M78 96 L62 305 C62 318, 72 326, 88 328 L212 328 C228 326, 238 318, 238 305 L222 96 Z" fill={`url(#tcb-${f1})`} />
    <path d="M100 96 C105 72, 125 60, 150 58 C175 60, 195 72, 200 96 C190 80, 170 70, 150 68 C130 70, 110 80, 100 96 Z" fill={f1} />
  </g>
);

const ThumbSVG: React.FC<ThumbSVGProps> = ({ fill1, fill2, fill3, productType = "hoodie" }) => {
  return (
    <svg viewBox="0 0 300 360" width={56} height={68} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      {productType === "hoodie" && <ThumbHoodie f1={fill1} f2={fill2} f3={fill3} />}
      {productType === "tee" && <ThumbTee f1={fill1} f2={fill2} f3={fill3} />}
      {productType === "compression" && <ThumbCompression f1={fill1} f2={fill2} f3={fill3} />}
    </svg>
  );
};

export default ThumbSVG;
