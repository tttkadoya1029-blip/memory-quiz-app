"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DamageEffectProps {
  damage: number;
  isPlayerDamage: boolean;
  show: boolean;
}

export function DamageEffect({
  damage,
  isPlayerDamage,
  show,
}: DamageEffectProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed inset-0 pointer-events-none z-50 flex items-center justify-center ${
            isPlayerDamage ? "bg-red-500/20" : ""
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`text-6xl font-black ${
              isPlayerDamage ? "text-red-500" : "text-cyan-400"
            }`}
            style={{
              textShadow: isPlayerDamage
                ? "0 0 20px #ff4757, 0 0 40px #ff4757"
                : "0 0 20px #00d4ff, 0 0 40px #00d4ff",
            }}
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={{ scale: 1.2, opacity: 1, y: isPlayerDamage ? 50 : -50 }}
            exit={{ scale: 0.8, opacity: 0, y: isPlayerDamage ? 100 : -100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {isPlayerDamage ? `-${damage}` : `${damage} HIT!`}
          </motion.div>

          {/* Attack effect for enemy damage */}
          {!isPlayerDamage && (
            <motion.div
              className="absolute"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 2, rotate: 180 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                className="text-cyan-400"
              >
                <path
                  d="M50 0 L55 40 L100 50 L55 60 L50 100 L45 60 L0 50 L45 40 Z"
                  fill="currentColor"
                  opacity="0.6"
                />
              </svg>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
