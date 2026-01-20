"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BattleStartOverlayProps {
  show: boolean;
  enemyName: string;
  onComplete: () => void;
}

export function BattleStartOverlay({
  show,
  enemyName,
  onComplete,
}: BattleStartOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={(definition) => {
            if (definition === "exit") return;
            setTimeout(onComplete, 2000);
          }}
        >
          <div className="text-center">
            {/* VS Text */}
            <motion.div
              className="text-6xl font-black mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
                style={{
                  textShadow: "0 0 30px rgba(0, 212, 255, 0.5)",
                }}
              >
                VS
              </span>
            </motion.div>

            {/* Enemy name */}
            <motion.div
              className="text-2xl font-bold text-red-400 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {enemyName}
            </motion.div>

            {/* DUEL START */}
            <motion.div
              className="text-4xl font-black tracking-widest"
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                style={{
                  textShadow: "0 0 40px rgba(255, 165, 2, 0.6)",
                }}
              >
                DUEL START!
              </span>
            </motion.div>

            {/* Decorative lines */}
            <motion.div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
