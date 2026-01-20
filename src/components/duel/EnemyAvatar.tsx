"use client";

import { motion } from "framer-motion";

interface EnemyAvatarProps {
  name: string;
  isHit?: boolean;
}

export function EnemyAvatar({ name, isHit = false }: EnemyAvatarProps) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={isHit ? { x: [0, -5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Enemy silhouette */}
      <motion.div
        className="w-24 h-24 relative"
        animate={isHit ? { opacity: [1, 0.3, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        {/* Abstract enemy shape */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 10px rgba(255, 71, 87, 0.5))" }}
        >
          {/* Main body */}
          <path
            d="M50 10 L80 35 L75 70 L50 90 L25 70 L20 35 Z"
            fill="url(#enemyGradient)"
            stroke="#ff4757"
            strokeWidth="2"
          />
          {/* Eyes */}
          <circle cx="38" cy="40" r="5" fill="#ff4757" className="animate-pulse" />
          <circle cx="62" cy="40" r="5" fill="#ff4757" className="animate-pulse" />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="enemyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a3e" />
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>
          </defs>
        </svg>
        {/* Damage effect */}
        {isHit && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-4xl">💥</span>
          </motion.div>
        )}
      </motion.div>
      {/* Enemy name */}
      <span className="mt-2 text-sm font-bold text-red-400 uppercase tracking-wider">
        {name}
      </span>
    </motion.div>
  );
}
