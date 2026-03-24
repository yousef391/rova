"use client";

import React from "react";

const NavBar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between px-7 py-5">
      <div className="flex items-center gap-2.5">
        {/* GymSpott logo — stylized "S" bolt */}
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect width="30" height="30" rx="7" fill="rgba(255,255,255,0.08)" />
          <path
            d="M18 7 L12 15 L18 15 L12 23"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.9"
          />
        </svg>
        <span
          className="text-white text-xl tracking-[0.25em] uppercase"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          GymSpott
        </span>
      </div>
      <div className="flex items-center gap-6">
        {["Oversize", "Compression", "Joggers"].map((item) => (
          <button
            key={item}
            className="text-white/60 text-sm hover:text-white transition-colors duration-200"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            {item}
          </button>
        ))}
        <button className="relative ml-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M6 6 C6 3.8 7.8 2 10 2 C12.2 2 14 3.8 14 6 L14 8 L6 8 Z"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M3 8 L17 8 L16 17 C16 17.5 15.5 18 15 18 L5 18 C4.5 18 4 17.5 4 17 Z"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
          </svg>
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full text-[9px] text-black font-bold flex items-center justify-center">
            2
          </span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
