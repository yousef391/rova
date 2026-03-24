"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Jacket } from "@/types/jacket";

interface BottomBarProps {
  jacket: Jacket;
  jackets: Jacket[];
  onSwitch: (idx: number) => void;
  currentIndex: number;
}

const BottomBar: React.FC<BottomBarProps> = ({
  jacket,
  jackets,
  onSwitch,
  currentIndex,
}) => {
  return (
    <div className="flex items-center justify-between px-7 py-4 border-t border-white/10">
      {/* Left: star rating + review */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex items-center gap-1 shrink-0">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill={star <= 4 ? "#facc15" : "none"}
              stroke={star <= 4 ? "#facc15" : "#facc15"}
              strokeWidth="1"
            >
              <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.4 3.3 12.3l.7-4.1-3-2.9 4.2-.7z" />
            </svg>
          ))}
          <span className="text-white/50 text-xs ml-1" style={{ fontFamily: "var(--font-dm)" }}>
            4.8
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={jacket.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
            className="text-white/40 text-xs italic truncate"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            {jacket.review}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Right: swatch dots */}
      <div className="flex items-center gap-2 ml-4 shrink-0">
        {jackets.map((j, idx) => (
          <button
            key={j.id}
            onClick={() => onSwitch(idx)}
            className="relative w-5 h-5 rounded-full transition-transform duration-200 hover:scale-110"
            style={{ backgroundColor: j.swatch }}
          >
            {idx === currentIndex && (
              <motion.div
                layoutId="swatch-ring"
                className="absolute inset-[-3px] rounded-full border-2 border-white/70"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomBar;
