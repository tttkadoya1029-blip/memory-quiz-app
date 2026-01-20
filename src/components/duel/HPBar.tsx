"use client";

import { motion } from "framer-motion";

interface HPBarProps {
  current: number;
  max: number;
  isPlayer?: boolean;
  showDamage?: number;
  label?: string;
}

export function HPBar({
  current,
  max,
  isPlayer = true,
  showDamage,
  label,
}: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const barClass = isPlayer ? "hp-bar-player" : "hp-bar-enemy";

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          <span className="text-sm font-bold text-white">
            {current} / {max}
          </span>
        </div>
      )}
      <div className="hp-bar-container h-4 relative">
        <motion.div
          className={`h-full ${barClass}`}
          initial={{ width: "100%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        {showDamage && showDamage > 0 && (
          <motion.span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white"
            initial={{ opacity: 1, scale: 1.5 }}
            animate={{ opacity: 0, scale: 1, y: -10 }}
            transition={{ duration: 0.6 }}
          >
            -{showDamage}
          </motion.span>
        )}
      </div>
    </div>
  );
}
